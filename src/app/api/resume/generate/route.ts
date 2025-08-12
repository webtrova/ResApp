import { NextRequest, NextResponse } from 'next/server';
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx';

export async function POST(request: NextRequest) {
  try {
    const { resumeData } = await request.json();

    if (!resumeData) {
      return NextResponse.json(
        { error: 'Resume data is required' },
        { status: 400 }
      );
    }

    // Create the Word document
    const doc = new Document({
      sections: [{
        properties: {
          page: {
            margin: {
              top: 1440, // 1 inch
              right: 1440,
              bottom: 1440,
              left: 1440,
            },
          },
        },
        children: [
          // Header with name and contact info
          new Paragraph({
            children: [
              new TextRun({
                text: (resumeData.personal.fullName || 'Your Name').toUpperCase(),
                size: 32,
                bold: true,
                color: '2E2E2E',
                font: 'Arial',
              }),
            ],
            spacing: { after: 200 },
          }),

          // Contact information
          new Paragraph({
            children: [
              new TextRun({
                text: `${resumeData.personal.email || ''} | ${resumeData.personal.phone || ''} | ${resumeData.personal.location || ''}`,
                size: 20,
                color: '666666',
                font: 'Arial',
              }),
            ],
            spacing: { after: 400 },
          }),

          // LinkedIn and Portfolio
          ...(resumeData.personal.linkedin || resumeData.personal.portfolio ? [
            new Paragraph({
              children: [
                new TextRun({
                  text: `${resumeData.personal.linkedin ? `LinkedIn: ${resumeData.personal.linkedin}` : ''}${resumeData.personal.linkedin && resumeData.personal.portfolio ? ' | ' : ''}${resumeData.personal.portfolio ? `Portfolio: ${resumeData.personal.portfolio}` : ''}`,
                  size: 18,
                  color: '666666',
                  font: 'Arial',
                }),
              ],
              spacing: { after: 400 },
            })
          ] : []),

          // Professional Summary
          ...(resumeData.summary.careerObjective ? [
            new Paragraph({
              text: 'PROFESSIONAL SUMMARY',
              heading: HeadingLevel.HEADING_1,
              spacing: { before: 200, after: 100 },
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: resumeData.summary.careerObjective,
                  size: 20,
                  color: '2E2E2E',
                }),
              ],
              spacing: { after: 400 },
            })
          ] : []),

          // Work Experience
          ...(resumeData.experience.length > 0 ? [
            new Paragraph({
              text: 'PROFESSIONAL EXPERIENCE',
              heading: HeadingLevel.HEADING_1,
              spacing: { before: 200, after: 100 },
            }),
            ...resumeData.experience.flatMap((exp: any, index: number) => [
              new Paragraph({
                children: [
                  new TextRun({
                    text: exp.jobTitle || '',
                    bold: true,
                    size: 22,
                    color: '2E2E2E',
                  }),
                  new TextRun({
                    text: ` | ${exp.companyName || ''}`,
                    size: 22,
                    color: '2E2E2E',
                  }),
                ],
                spacing: { after: 100 },
              }),
              new Paragraph({
                children: [
                  new TextRun({
                    text: `${exp.startDate || ''} - ${exp.endDate || 'Present'}`,
                    size: 18,
                    color: '666666',
                    italics: true,
                  }),
                ],
                spacing: { after: 200 },
              }),
              ...(exp.jobDescription ? [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: exp.jobDescription,
                      size: 20,
                      color: '2E2E2E',
                    }),
                  ],
                  spacing: { after: 200 },
                })
              ] : []),
              ...(exp.achievements && Array.isArray(exp.achievements) && exp.achievements.length > 0 ? 
                exp.achievements.map((achievement: any) => 
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: '- ' + (achievement || ''),
                        size: 20,
                        color: '2E2E2E',
                      }),
                    ],
                    spacing: { after: 100 },
                  })
                ) : []
              ),
              ...(index < resumeData.experience.length - 1 ? [
                new Paragraph({
                  text: '',
                  spacing: { after: 200 },
                })
              ] : [])
            ])
          ] : []),

          // Education
          ...(resumeData.education.length > 0 ? [
            new Paragraph({
              text: 'EDUCATION',
              heading: HeadingLevel.HEADING_1,
              spacing: { before: 200, after: 100 },
            }),
            ...resumeData.education.map((edu: any) => [
              new Paragraph({
                children: [
                  new TextRun({
                    text: edu.degree || 'Your Degree',
                    bold: true,
                    size: 22,
                    color: '2E2E2E',
                  }),
                ],
                spacing: { after: 100 },
              }),
              new Paragraph({
                children: [
                  new TextRun({
                    text: edu.institution || 'Your University',
                    size: 20,
                    color: '2E2E2E',
                  }),
                ],
                spacing: { after: 200 },
              }),
            ]).flat()
          ] : []),

          // Skills
          ...(resumeData.summary.keySkills.length > 0 ? [
            new Paragraph({
              text: 'SKILLS',
              heading: HeadingLevel.HEADING_1,
              spacing: { before: 200, after: 100 },
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: resumeData.summary.keySkills.join(', '),
                  size: 20,
                  color: '2E2E2E',
                }),
              ],
              spacing: { after: 400 },
            })
          ] : []),
        ],
      }],
    });

    // Generate the document buffer
    const buffer = await Packer.toBuffer(doc);

    // Return the document as a downloadable file
    return new NextResponse(buffer as any, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename="${resumeData.personal.fullName || 'Resume'}_${new Date().toISOString().split('T')[0]}.docx"`,
      },
    });

  } catch (error) {
    console.error('Error generating resume:', error);
    return NextResponse.json(
      { error: 'Failed to generate resume' },
      { status: 500 }
    );
  }
}

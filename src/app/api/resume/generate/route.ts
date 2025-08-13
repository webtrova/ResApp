import { NextRequest, NextResponse } from 'next/server';
import { 
  Document, 
  Packer, 
  Paragraph, 
  TextRun, 
  HeadingLevel,
  AlignmentType,
  BorderStyle,
  ShadingType,
  WidthType,
  Table,
  TableRow,
  TableCell,
  SectionType,
  Header,
  Footer
} from 'docx';

export async function POST(request: NextRequest) {
  try {
    const { resumeData } = await request.json();

    if (!resumeData) {
      return NextResponse.json(
        { error: 'Resume data is required' },
        { status: 400 }
      );
    }

    // Create the Word document with enhanced styling matching the preview
    const doc = new Document({
      styles: {
        default: {
          heading1: {
            run: {
              size: 32,
              bold: true,
              color: "1F2937", // Dark gray like in preview
              font: "Geist",
            },
            paragraph: {
              spacing: { after: 240, before: 240 },
              border: {
                bottom: {
                  color: "D1D5DB", // Light gray border
                  space: 4,
                  style: BorderStyle.SINGLE,
                  size: 8,
                }
              }
            },
          },
        },
      },
      sections: [{
        properties: {
          page: {
            margin: {
              top: 1150, // Slightly smaller margins for more content
              right: 1150,
              bottom: 1150,
              left: 1150,
            },
          },
        },
        children: [
          // Header - Name (Large and Centered like preview)
          new Paragraph({
            children: [
              new TextRun({
                text: resumeData.personal.fullName || 'Your Name',
                size: 48, // Larger like preview
                bold: true,
                color: '1F2937', // Dark gray matching preview
                font: 'Geist',
              }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 240 },
          }),

          // Contact Information (Centered like preview)
          new Paragraph({
            children: [
              new TextRun({
                text: `${resumeData.personal.email || ''} | ${resumeData.personal.phone || ''}`,
                size: 22,
                color: '6B7280', // Medium gray like preview
                font: 'Geist',
              }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 120 },
          }),

          // Second line of contact info if location exists
          ...(resumeData.personal.location ? [
            new Paragraph({
              children: [
                new TextRun({
                  text: resumeData.personal.location,
                  size: 22,
                  color: '6B7280',
                  font: 'Geist',
                }),
              ],
              alignment: AlignmentType.CENTER,
              spacing: { after: 120 },
            })
          ] : []),

          // LinkedIn and Portfolio (Centered like preview)
          ...(resumeData.personal.linkedin || resumeData.personal.portfolio ? [
            new Paragraph({
              children: [
                new TextRun({
                  text: [
                    resumeData.personal.linkedin ? resumeData.personal.linkedin : '',
                    resumeData.personal.linkedin && resumeData.personal.portfolio ? ' | ' : '',
                    resumeData.personal.portfolio ? resumeData.personal.portfolio : ''
                  ].join(''),
                  size: 20,
                  color: '6B7280',
                  font: 'Geist',
                }),
              ],
              alignment: AlignmentType.CENTER,
              spacing: { after: 480 },
            })
          ] : [
            new Paragraph({ text: '', spacing: { after: 480 } })
          ]),

          // Professional Summary (with proper heading styling)
          ...(resumeData.summary.careerObjective ? [
            new Paragraph({
              children: [
                new TextRun({
                  text: 'PROFESSIONAL SUMMARY',
                  size: 28,
                  bold: true,
                  color: '1F2937',
                  font: 'Geist',
                }),
              ],
              spacing: { before: 240, after: 160 },
              border: {
                bottom: {
                  color: "D1D5DB",
                  space: 4,
                  style: BorderStyle.SINGLE,
                  size: 8,
                }
              }
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: resumeData.summary.careerObjective,
                  size: 22,
                  color: '374151', // Slightly lighter than headings
                  font: 'Geist',
                }),
              ],
              spacing: { after: 480, line: 360 }, // Better line spacing
            })
          ] : []),

          // Work Experience (Enhanced styling)
          ...(resumeData.experience.length > 0 ? [
            new Paragraph({
              children: [
                new TextRun({
                  text: 'PROFESSIONAL EXPERIENCE',
                  size: 28,
                  bold: true,
                  color: '1F2937',
                  font: 'Geist',
                }),
              ],
              spacing: { before: 240, after: 240 },
              border: {
                bottom: {
                  color: "D1D5DB",
                  space: 4,
                  style: BorderStyle.SINGLE,
                  size: 8,
                }
              }
            }),
            ...resumeData.experience.flatMap((exp: any, index: number) => [
              // Job title and company (like preview)
              new Paragraph({
                children: [
                  new TextRun({
                    text: exp.jobTitle || '',
                    bold: true,
                    size: 24,
                    color: '1F2937',
                    font: 'Geist',
                  }),
                ],
                spacing: { after: 80 },
              }),
              new Paragraph({
                children: [
                  new TextRun({
                    text: exp.companyName || '',
                    size: 22,
                    color: '6B7280',
                    font: 'Geist',
                  }),
                ],
                spacing: { after: 160 },
              }),
              // Dates (right aligned like in preview would be ideal, but we'll keep it simple)
              new Paragraph({
                children: [
                  new TextRun({
                    text: `${exp.startDate || ''} - ${exp.endDate || 'Present'}`,
                    size: 20,
                    color: '6B7280',
                    italics: true,
                    font: 'Geist',
                  }),
                ],
                spacing: { after: 240 },
              }),
              // Job description
              ...(exp.jobDescription && exp.jobDescription !== 'Please add job description and responsibilities' ? [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: exp.jobDescription,
                      size: 22,
                      color: '374151',
                      font: 'Geist',
                    }),
                  ],
                  spacing: { after: 240, line: 300 },
                })
              ] : []),
              // Achievements with bullet points
              ...(exp.achievements && Array.isArray(exp.achievements) && exp.achievements.length > 0 ? 
                exp.achievements
                  .filter((achievement: string) => achievement && achievement.trim() && achievement !== 'Please add specific achievements and responsibilities')
                  .map((achievement: string) => 
                    new Paragraph({
                      children: [
                        new TextRun({
                          text: `• ${achievement}`,
                          size: 22,
                          color: '374151',
                          font: 'Geist',
                        }),
                      ],
                      spacing: { after: 120, line: 300 },
                      indent: { left: 360 }, // Indent bullet points
                    })
                  ) : []
              ),
              // Spacing between experience entries
              ...(index < resumeData.experience.length - 1 ? [
                new Paragraph({
                  text: '',
                  spacing: { after: 360 },
                })
              ] : [])
            ])
          ] : []),

          // Education (Enhanced styling)
          ...(resumeData.education.length > 0 ? [
            new Paragraph({
              children: [
                new TextRun({
                  text: 'EDUCATION',
                  size: 28,
                  bold: true,
                  color: '1F2937',
                  font: 'Geist',
                }),
              ],
              spacing: { before: 480, after: 240 },
              border: {
                bottom: {
                  color: "D1D5DB",
                  space: 4,
                  style: BorderStyle.SINGLE,
                  size: 8,
                }
              }
            }),
            ...resumeData.education.flatMap((edu: any, index: number) => [
              new Paragraph({
                children: [
                  new TextRun({
                    text: edu.degree || 'Your Degree',
                    bold: true,
                    size: 24,
                    color: '1F2937',
                    font: 'Geist',
                  }),
                ],
                spacing: { after: 80 },
              }),
              new Paragraph({
                children: [
                  new TextRun({
                    text: edu.institution || 'Your University',
                    size: 22,
                    color: '6B7280',
                    font: 'Geist',
                  }),
                ],
                spacing: { after: edu.major ? 80 : 240 },
              }),
              ...(edu.major ? [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: edu.major,
                      size: 22,
                      color: '6B7280',
                      font: 'Geist',
                    }),
                  ],
                  spacing: { after: 240 },
                })
              ] : []),
              ...(edu.graduationDate ? [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: edu.graduationDate,
                      size: 20,
                      color: '6B7280',
                      italics: true,
                      font: 'Geist',
                    }),
                  ],
                  spacing: { after: 240 },
                })
              ] : []),
              ...(edu.gpa ? [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: `GPA: ${edu.gpa}`,
                      size: 20,
                      color: '6B7280',
                      font: 'Geist',
                    }),
                  ],
                  spacing: { after: 240 },
                })
              ] : []),
              // Spacing between education entries
              ...(index < resumeData.education.length - 1 ? [
                new Paragraph({
                  text: '',
                  spacing: { after: 240 },
                })
              ] : [])
            ])
          ] : []),

          // Skills (Enhanced styling like preview)
          ...(resumeData.summary.keySkills.length > 0 ? [
            new Paragraph({
              children: [
                new TextRun({
                  text: 'SKILLS',
                  size: 28,
                  bold: true,
                  color: '1F2937',
                  font: 'Geist',
                }),
              ],
              spacing: { before: 480, after: 240 },
              border: {
                bottom: {
                  color: "D1D5DB",
                  space: 4,
                  style: BorderStyle.SINGLE,
                  size: 8,
                }
              }
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: resumeData.summary.keySkills.join(', '),
                  size: 22,
                  color: '374151',
                  font: 'Geist',
                }),
              ],
              spacing: { after: 480, line: 300 },
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

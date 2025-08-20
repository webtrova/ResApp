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
              spacing: { after: 360 },
            })
          ] : [
            new Paragraph({
              spacing: { after: 360 },
            })
          ]),

          // Summary Section
          ...(resumeData.summary?.careerObjective ? [
            new Paragraph({
              children: [
                new TextRun({
                  text: 'SUMMARY',
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
                  text: resumeData.summary.careerObjective,
                  size: 22,
                  color: '374151',
                  font: 'Geist',
                }),
              ],
              spacing: { after: 480, line: 300 },
            })
          ] : []),

          // Experience Section
          ...(resumeData.experience?.length > 0 ? [
            new Paragraph({
              children: [
                new TextRun({
                  text: 'EXPERIENCE',
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
            ...resumeData.experience.map((exp: any) => [
              new Paragraph({
                children: [
                  new TextRun({
                    text: exp.jobTitle || '',
                    size: 24,
                    bold: true,
                    color: '1F2937',
                    font: 'Geist',
                  }),
                ],
                spacing: { after: 60 },
              }),
              new Paragraph({
                children: [
                  new TextRun({
                    text: `${exp.companyName || ''} | ${exp.startDate || ''} - ${exp.endDate || 'Present'}`,
                    size: 20,
                    color: '6B7280',
                    font: 'Geist',
                  }),
                ],
                spacing: { after: 120 },
              }),
              ...(exp.jobDescription ? [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: exp.jobDescription,
                      size: 22,
                      color: '374151',
                      font: 'Geist',
                    }),
                  ],
                  spacing: { after: 120, line: 300 },
                })
              ] : []),
              ...(exp.achievements?.length > 0 ? exp.achievements.map((achievement: string) =>
                new Paragraph({
                  children: [
                    new TextRun({
                      text: `• ${achievement}`,
                      size: 22,
                      color: '374151',
                      font: 'Geist',
                    }),
                  ],
                  spacing: { after: 60, line: 300 },
                })
              ) : []),
              new Paragraph({
                spacing: { after: 240 },
              })
            ]).flat()
          ] : []),

          // Education Section
          ...(resumeData.education?.length > 0 ? [
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
            ...resumeData.education.map((edu: any) => [
              new Paragraph({
                children: [
                  new TextRun({
                    text: edu.degree || '',
                    size: 24,
                    bold: true,
                    color: '1F2937',
                    font: 'Geist',
                  }),
                ],
                spacing: { after: 60 },
              }),
              new Paragraph({
                children: [
                  new TextRun({
                    text: `${edu.school || ''} | ${edu.graduationYear || ''}`,
                    size: 20,
                    color: '6B7280',
                    font: 'Geist',
                  }),
                ],
                spacing: { after: 120 },
              }),
              ...(edu.fieldOfStudy ? [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: edu.fieldOfStudy,
                      size: 22,
                      color: '374151',
                      font: 'Geist',
                    }),
                  ],
                  spacing: { after: 120, line: 300 },
                })
              ] : []),
              new Paragraph({
                spacing: { after: 240 },
              })
            ]).flat()
          ] : []),

          // Skills (Enhanced styling like preview)
          ...(resumeData.summary?.keySkills?.length > 0 ? [
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
    const fileName = `${resumeData.personal.fullName || 'Resume'}_${new Date().toISOString().split('T')[0]}.docx`;
    
    return new NextResponse(buffer as any, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename="${fileName}"`,
      },
    });

  } catch (error) {
    console.error('Error generating resume document:', error);
    return NextResponse.json(
      { error: 'Failed to generate resume document' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { 
  Document, 
  Packer, 
  Paragraph, 
  TextRun, 
  HeadingLevel,
  AlignmentType,
  BorderStyle,
  SectionType,
  Header,
  Footer
} from 'docx';

export async function POST(request: NextRequest) {
  try {
    const { coverLetterData, format = 'docx' } = await request.json();

    if (!coverLetterData) {
      return NextResponse.json(
        { error: 'Cover letter data is required' },
        { status: 400 }
      );
    }

    // Create the Word document with professional styling
    const doc = new Document({
      styles: {
        default: {
          heading1: {
            run: {
              size: 32,
              bold: true,
              color: "1F2937",
              font: "Geist",
            },
            paragraph: {
              spacing: { after: 240, before: 240 },
            },
          },
        },
      },
      sections: [{
        properties: {
          type: SectionType.CONTINUOUS,
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
          // Header with contact information
          new Paragraph({
            children: [
              new TextRun({
                text: coverLetterData.personalInfo?.fullName || '[Your Name]',
                size: 28,
                bold: true,
                color: "1F2937",
                font: "Geist",
              }),
            ],
            spacing: { after: 120 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: coverLetterData.personalInfo?.email || '[Your Email]',
                size: 22,
                color: "374151",
                font: "Geist",
              }),
            ],
            spacing: { after: 60 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: coverLetterData.personalInfo?.phone || '[Your Phone]',
                size: 22,
                color: "374151",
                font: "Geist",
              }),
            ],
            spacing: { after: 60 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: coverLetterData.personalInfo?.location || '[Your Location]',
                size: 22,
                color: "374151",
                font: "Geist",
              }),
            ],
            spacing: { after: 480 },
          }),

          // Date
          new Paragraph({
            children: [
              new TextRun({
                text: new Date().toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                }),
                size: 22,
                color: "374151",
                font: "Geist",
              }),
            ],
            spacing: { after: 480 },
          }),

          // Recipient
          new Paragraph({
            children: [
              new TextRun({
                text: 'Dear Hiring Manager,',
                size: 22,
                color: "374151",
                font: "Geist",
              }),
            ],
            spacing: { after: 240 },
          }),

          // Opening paragraph
          ...(coverLetterData.opening ? [
            new Paragraph({
              children: [
                new TextRun({
                  text: coverLetterData.opening,
                  size: 22,
                  color: "374151",
                  font: "Geist",
                }),
              ],
              spacing: { after: 240, line: 360 },
            })
          ] : []),

          // Body paragraphs
          ...(coverLetterData.body?.map((bodyItem: any) => 
            new Paragraph({
              children: [
                new TextRun({
                  text: bodyItem.content,
                  size: 22,
                  color: "374151",
                  font: "Geist",
                }),
              ],
              spacing: { after: 240, line: 360 },
            })
          ) || []),

          // Closing paragraph
          ...(coverLetterData.closing ? [
            new Paragraph({
              children: [
                new TextRun({
                  text: coverLetterData.closing,
                  size: 22,
                  color: "374151",
                  font: "Geist",
                }),
              ],
              spacing: { after: 240, line: 360 },
            })
          ] : []),

          // Signature
          new Paragraph({
            children: [
              new TextRun({
                text: 'Sincerely,',
                size: 22,
                color: "374151",
                font: "Geist",
              }),
            ],
            spacing: { after: 240 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: coverLetterData.personalInfo?.fullName || '[Your Name]',
                size: 22,
                color: "374151",
                font: "Geist",
              }),
            ],
            spacing: { after: 120 },
          }),
        ],
      }],
    });

    // Generate the document buffer
    const buffer = await Packer.toBuffer(doc);

    // Return the document as a downloadable file
    const fileName = `Cover_Letter_${coverLetterData.jobDetails?.jobTitle || 'Position'}_${coverLetterData.jobDetails?.companyName || 'Company'}_${new Date().toISOString().split('T')[0]}.docx`;
    
    return new NextResponse(buffer as any, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename="${fileName}"`,
      },
    });

  } catch (error) {
    console.error('Error generating cover letter document:', error);
    return NextResponse.json(
      { error: 'Failed to generate cover letter document' },
      { status: 500 }
    );
  }
}

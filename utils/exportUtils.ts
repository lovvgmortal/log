import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx';
import { saveAs } from 'file-saver';
import { OptimizedResult } from '../types';

export const exportToPDF = (result: OptimizedResult, projectName: string) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // Title
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text(projectName, pageWidth / 2, 20, { align: 'center' });

    // Metadata
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, pageWidth / 2, 30, { align: 'center' });

    let yPos = 45;

    // Title & Description
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Title:', 15, yPos);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(12);
    const titleLines = doc.splitTextToSize(result.rewritten.title, pageWidth - 30);
    doc.text(titleLines, 15, yPos + 7);
    yPos += titleLines.length * 7 + 10;

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Description:', 15, yPos);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(12);
    const descLines = doc.splitTextToSize(result.rewritten.description, pageWidth - 30);
    doc.text(descLines, 15, yPos + 7);
    yPos += descLines.length * 7 + 15;

    // Script Sections
    result.rewritten.script_sections.forEach((section, index) => {
        if (yPos > 250) {
            doc.addPage();
            yPos = 20;
        }

        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text(`${index + 1}. ${section.title}`, 15, yPos);
        yPos += 10;

        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');
        const contentLines = doc.splitTextToSize(section.content, pageWidth - 30);
        contentLines.forEach((line: string) => {
            if (yPos > 280) {
                doc.addPage();
                yPos = 20;
            }
            doc.text(line, 15, yPos);
            yPos += 6;
        });
        yPos += 10;
    });

    // Save
    doc.save(`${projectName.replace(/[^a-z0-9]/gi, '_')}.pdf`);
};

export const exportToDOCX = async (result: OptimizedResult, projectName: string) => {
    const children: Paragraph[] = [];

    // Title
    children.push(
        new Paragraph({
            text: projectName,
            heading: HeadingLevel.TITLE,
            spacing: { after: 200 },
        })
    );

    // Generated date
    children.push(
        new Paragraph({
            children: [
                new TextRun({
                    text: `Generated: ${new Date().toLocaleDateString()}`,
                    italics: true,
                    size: 20,
                }),
            ],
            spacing: { after: 400 },
        })
    );

    // Title section
    children.push(
        new Paragraph({
            text: 'Title',
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 200, after: 100 },
        })
    );
    children.push(
        new Paragraph({
            text: result.rewritten.title,
            spacing: { after: 300 },
        })
    );

    // Description
    children.push(
        new Paragraph({
            text: 'Description',
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 200, after: 100 },
        })
    );
    children.push(
        new Paragraph({
            text: result.rewritten.description,
            spacing: { after: 300 },
        })
    );

    // Tags
    if (result.rewritten.tags) {
        children.push(
            new Paragraph({
                text: 'Tags',
                heading: HeadingLevel.HEADING_1,
                spacing: { before: 200, after: 100 },
            })
        );
        children.push(
            new Paragraph({
                text: result.rewritten.tags,
                spacing: { after: 300 },
            })
        );
    }

    // Script sections
    children.push(
        new Paragraph({
            text: 'Full Script',
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 400, after: 200 },
        })
    );

    result.rewritten.script_sections.forEach((section, index) => {
        children.push(
            new Paragraph({
                text: `${index + 1}. ${section.title}`,
                heading: HeadingLevel.HEADING_2,
                spacing: { before: 300, after: 100 },
            })
        );

        children.push(
            new Paragraph({
                text: section.content,
                spacing: { after: 200 },
            })
        );
    });

    const doc = new Document({
        sections: [{
            properties: {},
            children: children,
        }],
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, `${projectName.replace(/[^a-z0-9]/gi, '_')}.docx`);
};

export const exportToJSON = (data: any, filename: string) => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    saveAs(blob, `${filename}.json`);
};

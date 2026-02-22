const Footage = require('../models/Footage');
const { analyzeGameFootage } = require('../utils/gemini');

// @desc    Upload game footage
// @route   POST /api/footage
// @access  Private (Admin)
exports.uploadFootage = async (req, res, next) => {
    try {
        req.body.uploadedBy = req.user.id;
        const footage = await Footage.create(req.body);
        res.status(201).json({ success: true, data: footage });
    } catch (error) {
        next(error);
    }
};

// @desc    Get all game footage
// @route   GET /api/footage
// @access  Private
exports.getAllFootage = async (req, res, next) => {
    try {
        const footage = await Footage.find().sort('-createdAt');
        res.status(200).json({ success: true, data: footage });
    } catch (error) {
        next(error);
    }
};

// @desc    Query footage with AI
// @route   POST /api/footage/:id/query
// @access  Private
exports.queryFootage = async (req, res, next) => {
    try {
        const footage = await Footage.findById(req.params.id);
        if (!footage) {
            return res.status(404).json({ success: false, message: 'Footage not found' });
        }

        const { question } = req.body;
        console.log(`AI Query for footage: ${footage.title}`);

        try {
            // Use real Gemini AI for analysis
            const reply = await analyzeGameFootage(footage.title, footage.analysisText, footage.description, question);
            res.status(200).json({ success: true, reply });
        } catch (aiError) {
            console.error('AI Analysis Error:', aiError);
            res.status(500).json({ success: false, message: 'AI failed to respond. Please check server logs.' });
        }
    } catch (error) {
        console.error('Controller Error:', error);
        next(error);
    }
};

// @desc    Get AI summary of footage
// @route   GET /api/footage/:id/summary
// @access  Private
exports.getFootageSummary = async (req, res, next) => {
    try {
        const footage = await Footage.findById(req.params.id);
        if (!footage) {
            return res.status(404).json({ success: false, message: 'Footage not found' });
        }

        const { generateSummary } = require('../utils/gemini');
        const summary = await generateSummary(footage.title, footage.analysisText, footage.description);

        res.status(200).json({ success: true, summary });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete game footage
// @route   DELETE /api/footage/:id
// @access  Private (Admin)
exports.deleteFootage = async (req, res, next) => {
    try {
        console.log(`🗑️ Attempting to delete footage: ${req.params.id}`);
        const footage = await Footage.findByIdAndDelete(req.params.id);

        if (!footage) {
            console.log('Deletion failed: Footage not found');
            return res.status(404).json({ success: false, message: 'Footage not found' });
        }

        console.log('Footage deleted successfully from DB');
        res.status(200).json({ success: true, message: 'Footage deleted successfully' });
    } catch (error) {
        console.error('Deletion Error:', error);
        next(error);
    }
};

const PDFDocument = require('pdfkit');

// @desc    Export footage analysis as PDF
// @route   GET /api/footage/:id/export
// @access  Private
exports.exportFootageReport = async (req, res, next) => {
    try {
        const footage = await Footage.findById(req.params.id);
        if (!footage) {
            return res.status(404).json({ success: false, message: 'Footage not found' });
        }

        const { aiSummary } = req.body;

        const doc = new PDFDocument({
            margin: 50, // Standard margin
            bufferPages: true
        });

        // Tweak bottom margin specifically for content flow
        doc.page.margins.bottom = 40;

        // Settings for PDF download
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=Sportify_Report_${footage.title.replace(/\s+/g, '_')}.pdf`);

        doc.pipe(res);

        // Header / Branding
        doc.fillColor('#0ea5e9').fontSize(24).text('SPORTIFY', { align: 'center' });
        doc.fillColor('#64748b').fontSize(12).text('TACTICAL ANALYSIS REPORT', { align: 'center' });
        doc.moveDown(2);

        // Footage Title Section
        doc.fillColor('#1e293b').fontSize(18).text(footage.title, { underline: true });
        doc.fontSize(10).fillColor('#94a3b8').text(`Generated on ${new Date().toLocaleDateString()}`);
        doc.moveDown(1.5);

        // Description Section
        doc.fillColor('#1e293b').fontSize(14).text('Description', { bold: true });
        doc.moveDown(0.4);
        doc.fontSize(11).fillColor('#475569').text(footage.description, { lineGap: 4 });
        doc.moveDown(1.5);

        // Expert Notes Section
        doc.fillColor('#1e293b').fontSize(14).text('Professional Expert Notes', { bold: true });
        doc.moveDown(0.4);
        doc.fontSize(11).fillColor('#475569').font('Helvetica-Oblique').text(`"${footage.analysisText}"`, { lineGap: 4 });
        doc.font('Helvetica'); // Reset to standard font
        doc.moveDown(1.5);

        // AI Summary Section
        if (aiSummary) {
            // Only add page if very close to bottom
            if (doc.y > doc.page.height - 120) doc.addPage();

            doc.fillColor('#059669').fontSize(14).text('AI Tactical Summary', { bold: true });
            doc.moveDown(0.6);
            doc.fontSize(11).fillColor('#374151');

            const lines = aiSummary.split('\n').filter(p => p.trim());
            let count = 1;

            lines.forEach((line, index) => {
                const isListItem = /^[•*-]\s*/.test(line.trim());
                const cleanLine = line
                    .replace(/[*_]/g, '')
                    .replace(/^[•*-]\s*/, '')
                    .replace(/^\d+\.\s*/, '')
                    .trim();

                if (cleanLine) {
                    const textHeight = doc.heightOfString(cleanLine, { width: 480 });
                    if (doc.y + textHeight > doc.page.height - 60) {
                        doc.addPage();
                    }

                    if (isListItem) {
                        const currentY = doc.y;
                        doc.text(`${count}.`, 50, currentY);
                        doc.text(cleanLine, 80, currentY, {
                            width: 480,
                            lineGap: 6,
                            align: 'justify'
                        });
                        count++;
                    } else {
                        doc.text(cleanLine, 50, doc.y, {
                            width: 512,
                            lineGap: 4,
                            align: 'justify'
                        });
                    }

                    if (index < lines.length - 1) {
                        doc.moveDown(0.5);
                    }
                }
            });
        } else {
            doc.fontSize(10).fillColor('#94a3b8').text('Note: AI analysis was not included in this session.');
        }

        // Footer - Use absolute positioning to stay in safe zone
        const range = doc.bufferedPageRange();
        for (let i = range.start; i < (range.start + range.count); i++) {
            doc.switchToPage(i);
            // Temporarily disable auto-page-break for the footer
            doc.fontSize(8).fillColor('#94a3b8').text(
                'Proprietary of Sportify. Professional performance analysis system.',
                50,
                doc.page.height - 30, // Move closer to bottom edge
                { align: 'center', lineBreak: false }
            );
        }

        doc.end();

    } catch (error) {
        console.error('PDF Export Error:', error);
        next(error);
    }
};


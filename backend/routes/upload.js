const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  // Allow images and PDFs
  const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only images, PDFs, and documents are allowed'));
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: fileFilter
});

// @route   POST /api/upload/single
// @desc    Upload single file
// @access  Private
router.post('/single', authenticate, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: 'No file uploaded'
      });
    }

    const fileInfo = {
      filename: req.file.filename,
      originalName: req.file.originalname,
      url: `/uploads/${req.file.filename}`,
      size: req.file.size,
      mimeType: req.file.mimetype,
      uploadedAt: new Date()
    };

    res.json({
      message: 'File uploaded successfully',
      file: fileInfo
    });
  } catch (error) {
    console.error('File upload error:', error);
    res.status(500).json({
      message: 'Server error while uploading file'
    });
  }
});

// @route   POST /api/upload/multiple
// @desc    Upload multiple files
// @access  Private
router.post('/multiple', authenticate, upload.array('files', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        message: 'No files uploaded'
      });
    }

    const files = req.files.map(file => ({
      filename: file.filename,
      originalName: file.originalname,
      url: `/uploads/${file.filename}`,
      size: file.size,
      mimeType: file.mimetype,
      uploadedAt: new Date()
    }));

    res.json({
      message: 'Files uploaded successfully',
      files
    });
  } catch (error) {
    console.error('Multiple file upload error:', error);
    res.status(500).json({
      message: 'Server error while uploading files'
    });
  }
});

// @route   GET /api/upload/:filename
// @desc    Serve uploaded files
// @access  Private
router.get('/:filename', authenticate, (req, res) => {
  try {
    const filename = req.params.filename;
    const filePath = path.join(__dirname, '../uploads', filename);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        message: 'File not found'
      });
    }

    res.sendFile(filePath);
  } catch (error) {
    console.error('File serve error:', error);
    res.status(500).json({
      message: 'Server error while serving file'
    });
  }
});

// @route   DELETE /api/upload/:filename
// @desc    Delete uploaded file
// @access  Private
router.delete('/:filename', authenticate, async (req, res) => {
  try {
    const filename = req.params.filename;
    const filePath = path.join(__dirname, '../uploads', filename);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        message: 'File not found'
      });
    }

    fs.unlinkSync(filePath);

    res.json({
      message: 'File deleted successfully'
    });
  } catch (error) {
    console.error('File delete error:', error);
    res.status(500).json({
      message: 'Server error while deleting file'
    });
  }
});

// Mock OCR processing endpoint
// @route   POST /api/upload/ocr
// @desc    Process receipt image for OCR
// @access  Private
router.post('/ocr', authenticate, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: 'No image uploaded'
      });
    }

    // Check if file is an image
    if (!req.file.mimetype.startsWith('image/')) {
      return res.status(400).json({
        message: 'Only image files are allowed for OCR processing'
      });
    }

    // Mock OCR processing - in production, you would integrate with a real OCR service
    // like Google Vision API, AWS Textract, or Azure Computer Vision
    const mockOCRResult = {
      amount: '125.50',
      date: new Date().toISOString().split('T')[0],
      description: 'Restaurant Bill - Business Lunch',
      category: 'Food',
      vendor: 'The Gourmet Kitchen',
      confidence: 0.85
    };

    // Clean up uploaded file after processing
    const filePath = path.join(__dirname, '../uploads', req.file.filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    res.json({
      message: 'OCR processing completed',
      result: mockOCRResult
    });
  } catch (error) {
    console.error('OCR processing error:', error);
    res.status(500).json({
      message: 'Server error while processing OCR'
    });
  }
});

module.exports = router;

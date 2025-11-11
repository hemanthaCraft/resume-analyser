// ============================================================
// 🎯 ATS RESUME ANALYZER - FRONTEND (COMPLETE & FIXED)
// ============================================================

// Configuration
const API_URL = 'http://127.0.0.1:5000'; // Change for production

// State
let selectedFile = null;
let analysisResults = null;

// DOM Elements
const uploadZone = document.getElementById('upload-zone');
const fileInput = document.getElementById('resume-file');
const uploadPrompt = document.getElementById('upload-prompt');
const filePreview = document.getElementById('file-preview');
const fileName = document.getElementById('file-name');
const fileSize = document.getElementById('file-size');
const removeFileBtn = document.getElementById('remove-file');
const jobDescription = document.getElementById('job-description');
const charCount = document.getElementById('char-count');
const analyzeBtn = document.getElementById('analyze-btn');
const btnText = document.getElementById('btn-text');
const btnLoading = document.getElementById('btn-loading');
const resultsSection = document.getElementById('results-section');
const newAnalysisBtn = document.getElementById('new-analysis-btn');

// ============================================================
// 🎬 INITIALIZATION
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    updateAnalyzeButton();
    console.log('ATS Analyzer initialized');
});

function setupEventListeners() {
    // File upload
    uploadZone.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', handleFileSelect);
    removeFileBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        removeFile();
    });
    
    // Drag and drop
    uploadZone.addEventListener('dragover', handleDragOver);
    uploadZone.addEventListener('dragleave', handleDragLeave);
    uploadZone.addEventListener('drop', handleDrop);
    
    // Job description
    jobDescription.addEventListener('input', () => {
        charCount.textContent = `${jobDescription.value.length} characters`;
        updateAnalyzeButton();
    });
    
    // Buttons
    analyzeBtn.addEventListener('click', analyzeResume);
    newAnalysisBtn.addEventListener('click', resetForm);
    
    // Tabs
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => switchTab(btn.dataset.tab));
    });
    
    // Smooth scroll
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
}

// ============================================================
// 📁 FILE HANDLING
// ============================================================

function handleFileSelect(e) {
    const file = e.target.files[0];
    if (file) processFile(file);
}

function handleDragOver(e) {
    e.preventDefault();
    uploadZone.classList.add('drag-over');
}

function handleDragLeave(e) {
    e.preventDefault();
    uploadZone.classList.remove('drag-over');
}

function handleDrop(e) {
    e.preventDefault();
    uploadZone.classList.remove('drag-over');
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
}

function processFile(file) {
    const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword'];
    
    if (!validTypes.includes(file.type)) {
        alert('Please upload a PDF or DOCX file');
        return;
    }
    
    if (file.size > 10 * 1024 * 1024) {
        alert('File size must be less than 10MB');
        return;
    }
    
    selectedFile = file;
    fileName.textContent = file.name;
    fileSize.textContent = formatFileSize(file.size);
    uploadPrompt.classList.add('hidden');
    filePreview.classList.remove('hidden');
    updateAnalyzeButton();
}

function removeFile() {
    selectedFile = null;
    fileInput.value = '';
    uploadPrompt.classList.remove('hidden');
    filePreview.classList.add('hidden');
    updateAnalyzeButton();
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

function updateAnalyzeButton() {
    const hasFile = selectedFile !== null;
    const hasJobDesc = jobDescription.value.trim().length > 50;
    analyzeBtn.disabled = !(hasFile && hasJobDesc);
}

// ============================================================
// 🔍 ANALYSIS - IMPROVED WITH BETTER ERROR HANDLING
// ============================================================
// Add this function to your existing app.js

// ============================================================
// 📄 PDF REPORT DOWNLOAD FUNCTION
// ============================================================

async function downloadPDFReport() {
    if (!analysisResults) {
        alert('No analysis results available. Please analyze a resume first.');
        return;
    }
    
    // Get the download button
    const downloadBtn = document.getElementById('download-report-btn') || 
                       document.querySelector('[onclick*="downloadReport"]') ||
                       event.target;
    
    // Show loading state
    const originalText = downloadBtn.textContent;
    downloadBtn.disabled = true;
    downloadBtn.textContent = 'Generating PDF...';
    downloadBtn.classList.add('opacity-50', 'cursor-not-allowed');
    
    try {
        console.log('Requesting PDF generation...');
        console.log('   Sending data:', {
            score: analysisResults.ats_score,
            filename: analysisResults.filename
        });
        
        // Send POST request with analysis data
        const response = await fetch(`${API_URL}/api/download-report`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(analysisResults)
        });
        
        console.log('Response status:', response.status);
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || `Failed to generate PDF (${response.status})`);
        }
        
        // Get the PDF blob
        const blob = await response.blob();
        console.log('PDF received:', blob.size, 'bytes');
        
        // Create download link
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        
        // Generate filename with timestamp
        const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
        const filename = `ATS_Report_${timestamp}.pdf`;
        a.download = filename;
        
        // Trigger download
        document.body.appendChild(a);
        a.click();
        
        // Cleanup
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        console.log('PDF downloaded:', filename);
        
        // Show success message
        showToast('PDF Report downloaded successfully!', 'success');
        
    } catch (error) {
        console.error('PDF download failed:', error);
        
        alert(
            `PDF Download Failed: ${error.message}\n\n` +
            `Troubleshooting:\n` +
            `1. Check backend is running\n` +
            `2. Install: pip install reportlab\n` +
            `3. Check backend terminal for errors\n\n` +
            `Error: ${error.name}`
        );
    } finally {
        // Reset button state
        downloadBtn.disabled = false;
        downloadBtn.textContent = originalText;
        downloadBtn.classList.remove('opacity-50', 'cursor-not-allowed');
    }
}


// ============================================================
// 🎨 TOAST NOTIFICATION FUNCTION
// ============================================================

function showToast(message, type = 'info') {
    // Create toast container if it doesn't exist
    let toastContainer = document.getElementById('toast-container');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.id = 'toast-container';
        toastContainer.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 10000;
        `;
        document.body.appendChild(toastContainer);
    }
    
    // Create toast element
    const toast = document.createElement('div');
    
    const bgColor = {
        'success': '#10b981',
        'error': '#ef4444',
        'info': '#3b82f6',
        'warning': '#f59e0b'
    }[type] || '#6366f1';
    
    toast.style.cssText = `
        background: ${bgColor};
        color: white;
        padding: 16px 24px;
        border-radius: 8px;
        margin-bottom: 10px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        font-weight: 500;
        display: flex;
        align-items: center;
        gap: 10px;
        animation: slideIn 0.3s ease-out;
        min-width: 300px;
    `;
    
    toast.innerHTML = `
        <span style="font-size: 20px;">${type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️'}</span>
        <span>${message}</span>
    `;
    
    toastContainer.appendChild(toast);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Add CSS animation
if (!document.getElementById('toast-animations')) {
    const style = document.createElement('style');
    style.id = 'toast-animations';
    style.textContent = `
        @keyframes slideIn {
            from {
                transform: translateX(400px);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        
        @keyframes slideOut {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(400px);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
}

async function analyzeResume() {
    if (!selectedFile || !jobDescription.value.trim()) {
        alert('Please upload a resume and provide a job description');
        return;
    }
    
    // Show loading
    analyzeBtn.disabled = true;
    btnText.classList.add('hidden');
    btnLoading.classList.remove('hidden');
    
    const formData = new FormData();
    formData.append('resume', selectedFile);
    formData.append('job_description', jobDescription.value.trim());
    
    try {
        console.log('📤 Sending analysis request...');
        console.log('   File:', selectedFile.name);
        console.log('   JD Length:', jobDescription.value.length, 'chars');
        
        const response = await fetch(`${API_URL}/api/analyze`, {
            method: 'POST',
            body: formData
        });
        
        console.log('📥 Response status:', response.status);
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || `Server error: ${response.status}`);
        }
        
        analysisResults = await response.json();
        
        console.log('✅ Analysis received:');
        console.log('   Score:', analysisResults.ats_score);
        console.log('   Keyword Match:', analysisResults.keyword_match + '%');
        console.log('   Analysis Length:', analysisResults.detailed_analysis?.length || 0, 'chars');
        
        // Validate response
        if (!analysisResults.detailed_analysis) {
            console.error('❌ No detailed_analysis in response');
            throw new Error('No analysis in response');
        }
        
        if (analysisResults.detailed_analysis.length < 100) {
            console.warn('⚠️ Analysis seems very short');
        }
        
        displayResults(analysisResults);
        resultsSection.scrollIntoView({ behavior: 'smooth' });
        
    } catch (error) {
        console.error('❌ Analysis failed:', error);
        console.error('   Error type:', error.name);
        console.error('   Error message:', error.message);
        
        alert(
            `Analysis Failed: ${error.message}\n\n` +
            `Troubleshooting Steps:\n` +
            `1. Check backend is running (python app.py)\n` +
            `2. Verify GEMINI_API_KEY in .env file\n` +
            `3. Check internet connection\n` +
            `4. Look at backend terminal for errors\n` +
            `5. Try with shorter job description\n\n` +
            `Backend URL: ${API_URL}\n` +
            `Error Type: ${error.name}`
        );
    } finally {
        analyzeBtn.disabled = false;
        btnText.classList.remove('hidden');
        btnLoading.classList.add('hidden');
    }
}

// ============================================================
// 📊 DISPLAY RESULTS
// ============================================================

function displayResults(results) {
    console.log('📊 Displaying results...');
    resultsSection.classList.remove('hidden');
    animateScore(results.ats_score);
    
    // Keyword match
    document.getElementById('keyword-match').textContent = `${results.keyword_match}%`;
    document.getElementById('keyword-bar').style.width = `${results.keyword_match}%`;
    
    // Missing count
    document.getElementById('missing-count').textContent = results.missing_keywords.length;
    
    // Display sections
    displayFeedback(results.feedback);
    displayKeywords(results.matching_keywords, results.missing_keywords);
    displayDetailedAnalysis(results.detailed_analysis);

    setTimeout(() => {
        loadJobRecommendations();
    }, 1500);
}

function animateScore(targetScore) {
    const scoreElement = document.getElementById('ats-score');
    const scoreCircle = document.getElementById('score-circle');
    const scoreLabel = document.getElementById('score-label');
    
    // Animate number
    let current = 0;
    const increment = targetScore / 50;
    const interval = setInterval(() => {
        current += increment;
        if (current >= targetScore) {
            current = targetScore;
            clearInterval(interval);
        }
        scoreElement.textContent = Math.round(current);
    }, 20);
    
    // Animate circle
    const circumference = 2 * Math.PI * 56;
    const offset = circumference - (targetScore / 100) * circumference;
    scoreCircle.style.strokeDashoffset = offset;
    
    // Update label and color
    if (targetScore >= 80) {
        scoreLabel.textContent = 'Excellent! Ready to apply';
        scoreCircle.classList.remove('text-purple-500');
        scoreCircle.classList.add('text-green-500');
    } else if (targetScore >= 60) {
        scoreLabel.textContent = 'Good, minor improvements needed';
        scoreCircle.classList.remove('text-purple-500');
        scoreCircle.classList.add('text-yellow-500');
    } else {
        scoreLabel.textContent = 'Needs significant work';
        scoreCircle.classList.remove('text-purple-500');
        scoreCircle.classList.add('text-red-500');
    }
}

function displayFeedback(feedbackItems) {
    const feedbackList = document.getElementById('feedback-list');
    feedbackList.innerHTML = '';
    
    feedbackItems.forEach((item, index) => {
        const div = document.createElement('div');
        div.className = 'feedback-item';
        
        if (item.includes('✅')) {
            div.classList.add('feedback-success');
        } else if (item.includes('⚠️')) {
            div.classList.add('feedback-warning');
        } else if (item.includes('❌')) {
            div.classList.add('feedback-error');
        }
        
        div.innerHTML = `<p class="text-white">${item}</p>`;
        div.style.animationDelay = `${index * 0.1}s`;
        div.style.animation = 'fade-in 0.5s ease-out both';
        feedbackList.appendChild(div);
    });
}

function displayKeywords(matching, missing) {
    // Matching keywords
    const matchingContainer = document.getElementById('matching-keywords');
    matchingContainer.innerHTML = '';
    
    matching.slice(0, 20).forEach(keyword => {
        const span = document.createElement('span');
        span.className = 'keyword-tag keyword-found';
        span.textContent = keyword;
        matchingContainer.appendChild(span);
    });
    
    if (matching.length === 0) {
        matchingContainer.innerHTML = '<p class="text-gray-400">No matching keywords found</p>';
    }
    
    // Missing keywords
    const missingContainer = document.getElementById('missing-keywords');
    missingContainer.innerHTML = '';
    
    missing.slice(0, 15).forEach(keyword => {
        const span = document.createElement('span');
        span.className = 'keyword-tag keyword-missing';
        span.textContent = keyword;
        missingContainer.appendChild(span);
    });
    
    if (missing.length === 0) {
        missingContainer.innerHTML = '<p class="text-gray-400">Great! All important keywords present</p>';
    }
}

// ============================================================
// 📝 DISPLAY DETAILED ANALYSIS - COMPLETELY REWRITTEN & IMPROVED
// ============================================================

function displayDetailedAnalysis(analysisText) {
    const container = document.getElementById('detailed-analysis');
    
    console.log('📝 Rendering detailed analysis...');
    console.log('   Length:', analysisText.length, 'characters');
    console.log('   Preview:', analysisText.substring(0, 100) + '...');
    
    // Validate input
    if (!analysisText || analysisText.length < 50) {
        console.error('❌ Analysis text too short or missing');
        container.innerHTML = `
            <div class="bg-red-500/10 border border-red-500/30 rounded-lg p-6 text-center">
                <p class="text-red-400 text-lg mb-2">⚠️ Analysis Not Available</p>
                <p class="text-gray-400">The detailed analysis could not be generated.</p>
                <p class="text-sm text-gray-500 mt-2">Check backend logs for details.</p>
            </div>
        `;
        return;
    }
    
    // Enhanced markdown to HTML conversion
    let html = analysisText
        // First, escape HTML characters
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        
        // Normalize line breaks
        .replace(/\r\n/g, '\n')
        .replace(/\r/g, '\n')
        
        // Headers (## = h2, ### = h3, #### = h4)
        .replace(/^#### (.*?)$/gm, '<h4 class="text-lg font-semibold text-purple-200 mt-4 mb-2">$1</h4>')
        .replace(/^### (.*?)$/gm, '<h3 class="text-xl font-bold text-purple-300 mt-6 mb-3">$1</h3>')
        .replace(/^## (.*?)$/gm, '<h2 class="text-2xl font-bold text-white mt-8 mb-4 pb-2 border-b-2 border-purple-500/30">$1</h2>')
        
        // Bold and italic (must be before other replacements)
        .replace(/\*\*\*([^*]+)\*\*\*/g, '<strong class="text-yellow-300 font-bold">$1</strong>')
        .replace(/\*\*([^*]+)\*\*/g, '<strong class="text-white font-bold">$1</strong>')
        .replace(/\*([^*\n]+)\*/g, '<em class="text-gray-300 italic">$1</em>')
        
        // Inline code
        .replace(/`([^`]+)`/g, '<code class="bg-purple-500/20 px-2 py-1 rounded text-purple-200 text-sm font-mono">$1</code>')
        
        // Special formatting for BEFORE/AFTER/WHY examples
        .replace(/❌\s*BEFORE:/gi, '<div class="example-block bg-red-500/10 border-l-4 border-red-500 pl-4 py-3 my-4 rounded-r"><span class="text-red-400 font-bold text-lg">❌ BEFORE:</span> ')
        .replace(/✅\s*AFTER:/gi, '</div><div class="example-block bg-green-500/10 border-l-4 border-green-500 pl-4 py-3 my-4 rounded-r"><span class="text-green-400 font-bold text-lg">✅ AFTER:</span> ')
        .replace(/💡\s*WHY:/gi, '</div><div class="example-block bg-blue-500/10 border-l-4 border-blue-500 pl-4 py-3 my-4 rounded-r"><span class="text-blue-400 font-bold text-lg">💡 WHY:</span> ')
        
        // Close any open example blocks at the end
        .replace(/<div class="example-block[^>]*>[^<]*$/gm, '$&</div>')
        
        // Numbered lists
        .replace(/^\d+\.\s+(.+)$/gm, '<li class="ml-6 mb-3 pl-2 text-gray-300 list-item">$1</li>')
        
        // Bullet lists (various bullet types)
        .replace(/^[-•▪▫○●]\s+(.+)$/gm, '<li class="ml-6 mb-2 pl-2 text-gray-300 list-item">$1</li>')
        
        // Wrap consecutive list items in ul tags
        .replace(/(<li class="[^"]*list-item"[^>]*>.*?<\/li>\n?)+/g, function(match) {
            return '<ul class="list-disc list-inside space-y-2 my-4 pl-4">' + match + '</ul>';
        })
        
        // Blockquotes
        .replace(/^&gt;\s*(.+)$/gm, '<blockquote class="border-l-4 border-purple-500 pl-4 italic text-gray-400 my-3">$1</blockquote>')
        
        // Paragraphs (text not already in a tag)
        .replace(/^(?!<[h|u|l|d|b|c])(.+)$/gm, '<p class="text-gray-300 leading-relaxed mb-3">$1</p>')
        
        // Clean up excessive whitespace and empty tags
        .replace(/<p[^>]*>\s*<\/p>/g, '')
        .replace(/<\/div>\s*<\/div>/g, '</div>')
        .replace(/\n\s*\n+/g, '\n')
        
        .trim();
    
    // Wrap in container with proper styling
    container.innerHTML = `<div class="prose-content space-y-4">${html}</div>`;
    
    // Also extract and display improvements in the dedicated tab
    extractAndDisplayImprovements(analysisText);
    
    console.log('✅ Detailed analysis rendered successfully');
}

// ============================================================
// 🚀 EXTRACT AND DISPLAY IMPROVEMENTS - NEW FUNCTION
// ============================================================

function extractAndDisplayImprovements(analysisText) {
    const container = document.getElementById('improvements-content');
    
    console.log('🚀 Extracting priority improvements...');
    
    // Try to extract TOP PRIORITY ACTIONS section
    const priorityMatch = analysisText.match(/## 🚀 TOP \d+ PRIORITY ACTIONS([\s\S]*?)(?=##|$)/i);
    
    if (priorityMatch && priorityMatch[1]) {
        console.log('   Found priority actions section');
        
        let improvementsHtml = priorityMatch[1]
            // Format: "1. **Action** - Explanation"
            .replace(/^\d+\.\s*\*\*(.+?)\*\*\s*-\s*(.+)$/gm, 
                '<div class="improvement-card bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/30 rounded-lg p-5 mb-4 hover:scale-102 transition-transform">' +
                '<div class="flex items-start gap-3">' +
                '<span class="text-2xl">🎯</span>' +
                '<div>' +
                '<h4 class="text-lg font-bold text-purple-300 mb-2">$1</h4>' +
                '<p class="text-gray-300 leading-relaxed">$2</p>' +
                '</div>' +
                '</div>' +
                '</div>')
            
            // Format: "1. Action: Explanation"
            .replace(/^\d+\.\s*([^:]+):\s*(.+)$/gm,
                '<div class="improvement-card bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/30 rounded-lg p-5 mb-4">' +
                '<div class="flex items-start gap-3">' +
                '<span class="text-2xl">🎯</span>' +
                '<div>' +
                '<h4 class="text-lg font-bold text-purple-300 mb-2">$1</h4>' +
                '<p class="text-gray-300">$2</p>' +
                '</div>' +
                '</div>' +
                '</div>')
            
            // Format: "1. Simple action"
            .replace(/^\d+\.\s+(.+)$/gm,
                '<div class="improvement-card bg-purple-500/10 border-l-4 border-purple-500 pl-5 py-4 mb-3 rounded-r">' +
                '<p class="text-gray-300 leading-relaxed">$1</p>' +
                '</div>')
            
            .trim();
        
        container.innerHTML = `
            <div class="space-y-4">
                <h3 class="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                    <span class="text-3xl">🚀</span>
                    <span>Focus on These Actions First</span>
                </h3>
                ${improvementsHtml}
                <div class="mt-8 p-5 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                    <p class="text-sm text-gray-300 flex items-start gap-2">
                        <span class="text-xl">💡</span>
                        <span><strong>Pro Tip:</strong> Implement these changes in order of priority for maximum impact on your ATS score. Start with #1 and work your way down.</span>
                    </p>
                </div>
            </div>
        `;
        
        console.log('✅ Priority improvements displayed');
        return;
    }
    
    // Fallback: Try to extract AREAS FOR IMPROVEMENT section
    const improvementsMatch = analysisText.match(/## ⚠️ AREAS FOR IMPROVEMENT([\s\S]*?)(?=##|$)/i);
    
    if (improvementsMatch && improvementsMatch[1]) {
        console.log('   Found areas for improvement section');
        
        let improvementsHtml = improvementsMatch[1]
            .replace(/^\d+\.\s+(.+)$/gm, 
                '<div class="bg-yellow-500/10 border-l-4 border-yellow-500 pl-5 py-4 mb-3 rounded-r">' +
                '<p class="text-gray-300 leading-relaxed">$1</p>' +
                '</div>')
            .trim();
        
        container.innerHTML = `
            <div class="space-y-4">
                <h3 class="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                    <span class="text-3xl">⚠️</span>
                    <span>Areas Needing Attention</span>
                </h3>
                ${improvementsHtml}
            </div>
        `;
        
        console.log('✅ Improvements displayed (fallback)');
        return;
    }
    
    // Ultimate fallback
    console.log('   No specific improvements section found');
    container.innerHTML = `
        <div class="text-center py-12">
            <p class="text-gray-400 text-lg mb-4">
                📝 Detailed improvements are available in the <strong class="text-white">Detailed Analysis</strong> tab.
            </p>
            <p class="text-gray-500">
                Look for sections marked with 🚀 TOP PRIORITY ACTIONS and ⚠️ AREAS FOR IMPROVEMENT.
            </p>
        </div>
    `;
}

// ============================================================
// 🔄 TAB SWITCHING
// ============================================================

function switchTab(tabName) {
    console.log('🔄 Switching to tab:', tabName);
    
    // Update buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
    
    // Update content
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.add('hidden');
    });
    document.getElementById(`${tabName}-tab`).classList.remove('hidden');
}

// ============================================================
// 🔄 RESET
// ============================================================

function resetForm() {
    console.log('🔄 Resetting form...');
    removeFile();
    jobDescription.value = '';
    charCount.textContent = '0 characters';
    resultsSection.classList.add('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    analysisResults = null;
}

// ============================================================
// 🎨 ENHANCED CUSTOM STYLES
// ============================================================

const style = document.createElement('style');
style.textContent = `
/* Scrollable content area */
.prose-content {
    max-height: 75vh;
    overflow-y: auto;
    padding-right: 1rem;
}

/* Custom scrollbar */
.prose-content::-webkit-scrollbar {
    width: 10px;
}

.prose-content::-webkit-scrollbar-track {
    background: rgba(139, 92, 246, 0.1);
    border-radius: 5px;
}

.prose-content::-webkit-scrollbar-thumb {
    background: rgba(139, 92, 246, 0.5);
    border-radius: 5px;
}

.prose-content::-webkit-scrollbar-thumb:hover {
    background: rgba(139, 92, 246, 0.7);
}

/* Animated headers */
.prose-content h2 {
    animation: slideIn 0.5s ease-out;
}

.prose-content h3 {
    animation: slideIn 0.6s ease-out;
}

/* Example blocks hover effect */
.example-block {
    transition: all 0.3s ease;
}

.example-block:hover {
    transform: translateX(5px);
    box-shadow: 0 4px 12px rgba(139, 92, 246, 0.2);
}

/* Improvement cards */
.improvement-card {
    transition: all 0.3s ease;
}

.improvement-card:hover {
    box-shadow: 0 8px 24px rgba(139, 92, 246, 0.3);
}

/* List styling */
.prose-content ul {
    padding-left: 1.5rem;
}

.prose-content li {
    position: relative;
}

.prose-content li::marker {
    color: #a78bfa;
    font-weight: bold;
}

/* Code blocks */
.prose-content code {
    font-family: 'Courier New', Courier, monospace;
    font-size: 0.9em;
}

/* Animations */
@keyframes slideIn {
    from {
        opacity: 0;
        transform: translateX(-20px);
    }
    to {
        opacity: 1;
        transform: translateX(0);
    }
}

@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(10px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

/* Smooth transitions */
* {
    scroll-behavior: smooth;
}

/* Loading states */
.shimmer {
    background: linear-gradient(90deg, 
        rgba(255, 255, 255, 0.05) 0%, 
        rgba(255, 255, 255, 0.1) 50%, 
        rgba(255, 255, 255, 0.05) 100%);
    background-size: 200% 100%;
    animation: shimmer 2s infinite;
}

@keyframes shimmer {
    0% { background-position: -200% 0; }
    100% { background-position: 200% 0; }
}

/* Responsive improvements */
@media (max-width: 768px) {
    .prose-content {
        max-height: 60vh;
        padding-right: 0.5rem;
    }
    
    .improvement-card {
        padding: 1rem;
    }
    
    .example-block {
        padding: 0.75rem;
    }
}
`;
document.head.appendChild(style);

console.log('✅ ATS Analyzer Frontend loaded successfully');
console.log('📊 API URL:', API_URL);
console.log('🎨 Custom styles applied');

// ============================================================
// 📧 EMAIL MODAL FUNCTIONS - ADD THESE TO app.js
// ============================================================

function openEmailModal() {
    if (!analysisResults) {
        alert('No analysis results available. Please analyze a resume first.');
        return;
    }
    
    const modal = document.getElementById('email-modal');
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    
    // Clear previous input and status
    document.getElementById('recipient-email').value = '';
    const statusDiv = document.getElementById('email-status');
    statusDiv.classList.add('hidden');
}

function closeEmailModal() {
    const modal = document.getElementById('email-modal');
    modal.classList.add('hidden');
    modal.classList.remove('flex');
}

// Close modal when clicking outside
document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('email-modal');
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeEmailModal();
            }
        });
    }
});

async function sendEmailReport() {
    const emailInput = document.getElementById('recipient-email');
    const sendBtn = document.getElementById('send-email-btn');
    const btnText = document.getElementById('send-btn-text');
    const btnLoading = document.getElementById('send-btn-loading');
    const statusDiv = document.getElementById('email-status');
    
    const email = emailInput.value.trim();
    
    // Validate email
    const emailPattern = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$/i;
    if (!email) {
        showEmailStatus('Please enter an email address', 'error');
        emailInput.focus();
        return;
    }
    
    if (!emailPattern.test(email)) {
        showEmailStatus('Please enter a valid email address', 'error');
        emailInput.focus();
        return;
    }
    
    if (!analysisResults) {
        showEmailStatus('No analysis data available', 'error');
        return;
    }
    
    // Show loading state
    sendBtn.disabled = true;
    btnText.classList.add('hidden');
    btnLoading.classList.remove('hidden');
    statusDiv.classList.add('hidden');
    
    try {
        console.log('📧 Sending email to:', email);
        
        const response = await fetch(`${API_URL}/api/send-email`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: email,
                analysis_data: analysisResults
            })
        });
        
        const result = await response.json();
        
        if (response.ok && result.success) {
            console.log('✅ Email sent successfully');
            showEmailStatus(`✅ Report sent successfully to ${email}!`, 'success');
            
            // Close modal after 2 seconds
            setTimeout(() => {
                closeEmailModal();
                showToast(`📧 Report sent to ${email}`, 'success');
            }, 2000);
            
        } else {
            throw new Error(result.error || 'Failed to send email');
        }
        
    } catch (error) {
        console.error('❌ Email sending failed:', error);
        showEmailStatus(`❌ ${error.message}`, 'error');
    } finally {
        // Reset button state
        sendBtn.disabled = false;
        btnText.classList.remove('hidden');
        btnLoading.classList.add('hidden');
    }
}

// ============================================================
// 🤖 AI AUTO-REWRITE FUNCTIONS - NEW FEATURE
// Add this AFTER sendEmailReport() function (around line 850)
// ============================================================

let selectedRewriteSection = null;

function openRewriteModal() {
    if (!analysisResults) {
        alert('Please analyze a resume first');
        return;
    }
    
    const modal = document.getElementById('rewrite-modal');
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    
    // Reset state
    selectedRewriteSection = null;
    document.getElementById('rewrite-current-text').value = '';
    document.getElementById('rewrite-result').classList.add('hidden');
    document.getElementById('rewrite-status').classList.add('hidden');
    
    // Reset section buttons
    document.querySelectorAll('.rewrite-section-btn').forEach(btn => {
        btn.classList.remove('bg-purple-500/40', 'border-purple-500');
        btn.classList.add('bg-white/5', 'border-purple-500/30');
    });
}

function closeRewriteModal() {
    const modal = document.getElementById('rewrite-modal');
    modal.classList.add('hidden');
    modal.classList.remove('flex');
}

function selectRewriteSection(section) {
    selectedRewriteSection = section;
    
    // Update button states
    document.querySelectorAll('.rewrite-section-btn').forEach(btn => {
        if (btn.dataset.section === section) {
            btn.classList.add('bg-purple-500/40', 'border-purple-500');
            btn.classList.remove('bg-white/5', 'border-purple-500/30');
        } else {
            btn.classList.remove('bg-purple-500/40', 'border-purple-500');
            btn.classList.add('bg-white/5', 'border-purple-500/30');
        }
    });
    
    // Hide previous result
    document.getElementById('rewrite-result').classList.add('hidden');
    document.getElementById('rewrite-status').classList.add('hidden');
}

async function generateRewrite() {
    const currentText = document.getElementById('rewrite-current-text').value.trim();
    const btn = document.getElementById('generate-rewrite-btn');
    const btnText = document.getElementById('rewrite-btn-text');
    const btnLoading = document.getElementById('rewrite-btn-loading');
    const statusDiv = document.getElementById('rewrite-status');
    
    if (!selectedRewriteSection) {
        showRewriteStatus('Please select a section type (Summary, Experience, or Skills)', 'error');
        return;
    }
    
    if (!currentText || currentText.length < 10) {
        showRewriteStatus('Please enter at least 10 characters of text to rewrite', 'error');
        return;
    }
    
    // Show loading
    btn.disabled = true;
    btnText.classList.add('hidden');
    btnLoading.classList.remove('hidden');
    statusDiv.classList.add('hidden');
    document.getElementById('rewrite-result').classList.add('hidden');
    
    try {
        console.log('🤖 Requesting AI rewrite for:', selectedRewriteSection);
        
        const response = await fetch(`${API_URL}/api/ai-rewrite`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                section_type: selectedRewriteSection,
                current_text: currentText,
                job_description: jobDescription.value.trim(),
                resume_keywords: {
                    technical_skills: analysisResults?.matching_keywords || []
                }
            })
        });
        
        const result = await response.json();
        
        if (response.ok && result.success) {
            console.log('✅ Rewrite generated successfully');
            displayRewriteResult(result);
            showToast('✨ AI rewrite generated!', 'success');
        } else {
            throw new Error(result.error || 'Failed to generate rewrite');
        }
        
    } catch (error) {
        console.error('❌ Rewrite failed:', error);
        showRewriteStatus(`❌ ${error.message}`, 'error');
    } finally {
        btn.disabled = false;
        btnText.classList.remove('hidden');
        btnLoading.classList.add('hidden');
    }
}

function displayRewriteResult(result) {
    const resultDiv = document.getElementById('rewrite-result');
    const textDiv = document.getElementById('rewritten-text');
    const improvementsList = document.getElementById('improvements-list');
    
    // Display rewritten text
    textDiv.textContent = result.rewritten_text;
    
    // Display improvements
    if (result.improvements && result.improvements.length > 0) {
        improvementsList.innerHTML = `
            <h5 class="text-sm font-semibold text-white mb-2">✨ Improvements:</h5>
            <ul class="text-sm text-gray-300 space-y-1">
                ${result.improvements.map(imp => `<li class="flex items-start gap-2">
                    <span class="text-green-400">✓</span>
                    <span>${escapeHtml(imp)}</span>
                </li>`).join('')}
            </ul>
        `;
    } else {
        improvementsList.innerHTML = '';
    }
    
    resultDiv.classList.remove('hidden');
}

function copyRewrittenText() {
    const text = document.getElementById('rewritten-text').textContent;
    
    navigator.clipboard.writeText(text).then(() => {
        showToast('📋 Copied to clipboard!', 'success');
    }).catch(err => {
        console.error('Copy failed:', err);
        showToast('Failed to copy', 'error');
    });
}

function showRewriteStatus(message, type) {
    const statusDiv = document.getElementById('rewrite-status');
    statusDiv.classList.remove('hidden', 'bg-green-500/20', 'border-green-500', 'text-green-400', 
                               'bg-red-500/20', 'border-red-500', 'text-red-400');
    
    if (type === 'success') {
        statusDiv.classList.add('bg-green-500/20', 'border', 'border-green-500', 'text-green-400');
    } else {
        statusDiv.classList.add('bg-red-500/20', 'border', 'border-red-500', 'text-red-400');
    }
    
    statusDiv.textContent = message;
}

// Close modal on Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        const modal = document.getElementById('rewrite-modal');
        if (modal && !modal.classList.contains('hidden')) {
            closeRewriteModal();
        }
    }
});

function showEmailStatus(message, type) {
    const statusDiv = document.getElementById('email-status');
    statusDiv.classList.remove('hidden', 'bg-green-500/20', 'border-green-500', 'text-green-400', 
                               'bg-red-500/20', 'border-red-500', 'text-red-400');
    
    if (type === 'success') {
        statusDiv.classList.add('bg-green-500/20', 'border', 'border-green-500', 'text-green-400');
    } else {
        statusDiv.classList.add('bg-red-500/20', 'border', 'border-red-500', 'text-red-400');
    }
    
    statusDiv.textContent = message;
}

// Add keyboard shortcut: Escape to close modal
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        const modal = document.getElementById('email-modal');
        if (modal && !modal.classList.contains('hidden')) {
            closeEmailModal();
        }
    }
});

let jobRecommendationsData = null;

/**
 * Load job recommendations based on resume analysis
 */
async function loadJobRecommendations() {
    if (!analysisResults) {
        console.error('No analysis results available');
        showJobError('Please analyze a resume first');
        return;
    }

    const container = document.getElementById('jobs-container');
    const loading = document.getElementById('jobs-loading');
    const noJobsFound = document.getElementById('no-jobs-found');
    const searchParamsBox = document.getElementById('search-params-box');

    // Show loading
    loading.classList.remove('hidden');
    noJobsFound.classList.add('hidden');
    searchParamsBox.classList.add('hidden');
    
    // Clear previous jobs
    const existingJobs = container.querySelectorAll('.job-card');
    existingJobs.forEach(card => card.remove());

    try {
        console.log('💼 Fetching job recommendations...');

        const response = await fetch(`${API_URL}/api/job-recommendations`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                resume_text: analysisResults.resume_text || '',
                resume_keywords: {
                    technical_skills: analysisResults.matching_keywords || [],
                    experience_requirements: []
                },
                location: 'United States'
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();
        
        if (!data.success) {
            throw new Error(data.error || 'Failed to fetch jobs');
        }

        jobRecommendationsData = data;
        
        console.log(`✅ Received ${data.jobs.length} job recommendations`);

        // Hide loading
        loading.classList.add('hidden');

        if (data.jobs.length === 0) {
            noJobsFound.classList.remove('hidden');
            return;
        }

        // Display search parameters
        displaySearchParams(data.search_params);

        // Display jobs
        displayJobs(data.jobs);

    } catch (error) {
        console.error('❌ Job recommendation error:', error);
        loading.classList.add('hidden');
        showJobError(error.message);
    }
}

/**
 * Display search parameters
 */
function displaySearchParams(params) {
    const box = document.getElementById('search-params-box');
    const queryEl = document.getElementById('search-query');
    const experienceEl = document.getElementById('search-experience');
    const skillsEl = document.getElementById('search-skills');

    queryEl.textContent = params.query || 'N/A';
    experienceEl.textContent = params.experience_level.replace('_', ' ').toUpperCase();

    skillsEl.innerHTML = '';
    (params.skills || []).slice(0, 5).forEach(skill => {
        const tag = document.createElement('span');
        tag.className = 'px-2 py-1 bg-purple-500/20 text-purple-300 rounded text-xs';
        tag.textContent = skill;
        skillsEl.appendChild(tag);
    });

    box.classList.remove('hidden');
}

/**
 * Display job cards
 */
function displayJobs(jobs) {
    const container = document.getElementById('jobs-container');

    jobs.forEach((job, index) => {
        const jobCard = createJobCard(job, index);
        container.appendChild(jobCard);
    });
}

/**
 * Create a single job card
 */
function createJobCard(job, index) {
    const card = document.createElement('div');
    card.className = 'job-card glass-card p-6 hover:scale-102 transition-all duration-300';
    card.style.animationDelay = `${index * 0.1}s`;
    card.style.animation = 'fade-in 0.5s ease-out both';

    // Match score color
    const scoreColor = job.match_score >= 85 ? 'green' : job.match_score >= 70 ? 'yellow' : 'purple';
    const scoreColorClass = {
        'green': 'bg-green-500/20 text-green-400 border-green-500/30',
        'yellow': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
        'purple': 'bg-purple-500/20 text-purple-400 border-purple-500/30'
    }[scoreColor];

    card.innerHTML = `
        <div class="flex items-start justify-between mb-4">
            <div class="flex-1">
                <h3 class="text-xl font-bold text-white mb-2 hover:text-purple-300 transition cursor-pointer">
                    ${escapeHtml(job.title)}
                </h3>
                <div class="flex flex-wrap items-center gap-3 text-sm text-gray-400 mb-3">
                    <span class="flex items-center gap-1">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                        </svg>
                        <strong class="text-white">${escapeHtml(job.company)}</strong>
                    </span>
                    <span class="flex items-center gap-1">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                        </svg>
                        ${escapeHtml(job.location)}
                    </span>
                    <span class="flex items-center gap-1">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                        ${escapeHtml(job.posted_date)}
                    </span>
                </div>
            </div>
            <div class="ml-4">
                <div class="px-4 py-2 ${scoreColorClass} rounded-lg text-center border">
                    <div class="text-2xl font-bold">${job.match_score}%</div>
                    <div class="text-xs">Match</div>
                </div>
            </div>
        </div>

        <p class="text-gray-300 text-sm mb-4 line-clamp-3">
            ${escapeHtml(job.description)}
        </p>

        <div class="flex items-center justify-between pt-4 border-t border-gray-700">
            <span class="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-lg text-sm">
                ${escapeHtml(job.employment_type)}
            </span>
            <a 
                href="${job.apply_link}" 
                target="_blank" 
                rel="noopener noreferrer"
                class="px-6 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white font-semibold rounded-lg hover:shadow-lg transition flex items-center gap-2"
            >
                Apply Now
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
                </svg>
            </a>
        </div>
    `;

    return card;
}

/**
 * Show job error message
 */
function showJobError(message) {
    const container = document.getElementById('jobs-container');
    const loading = document.getElementById('jobs-loading');
    
    loading.classList.add('hidden');

    const errorDiv = document.createElement('div');
    errorDiv.className = 'bg-red-500/10 border border-red-500/30 rounded-lg p-8 text-center';
    errorDiv.innerHTML = `
        <div class="text-5xl mb-4">⚠️</div>
        <h3 class="text-xl font-bold text-red-400 mb-2">Failed to Load Jobs</h3>
        <p class="text-gray-400 mb-4">${escapeHtml(message)}</p>
        <button 
            onclick="loadJobRecommendations()"
            class="px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white font-bold rounded-lg hover:shadow-lg transition"
        >
            Retry
        </button>
    `;
    
    container.appendChild(errorDiv);
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
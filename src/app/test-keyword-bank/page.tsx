'use client';

import React, { useState } from 'react';

export default function TestKeywordBankPage() {
  const [text, setText] = useState('');
  const [industry, setIndustry] = useState('plumbing');
  const [level, setLevel] = useState('entry');
  const [result, setResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const industries = [
    'technology', 'healthcare', 'finance', 'sales', 
    'plumbing', 'hvac', 'electrical'
  ];

  const levels = ['entry', 'mid', 'senior', 'executive'];

  const sampleTexts = {
    plumbing: [
      "I fixed pipes and helped customers with leaks",
      "I installed new plumbing systems in homes",
      "I maintained water heaters and did emergency repairs"
    ],
    hvac: [
      "I serviced air conditioning units and fixed heating systems", 
      "I installed new HVAC systems in commercial buildings",
      "I performed maintenance on refrigeration equipment"
    ],
    electrical: [
      "I wired new buildings and installed electrical panels",
      "I troubleshot electrical problems and did repairs",
      "I upgraded electrical systems to meet code requirements"
    ],
    technology: [
      "I built web applications and fixed bugs",
      "I worked on databases and helped users with problems",
      "I developed software features and managed projects"
    ],
    healthcare: [
      "I took care of patients and administered medications",
      "I monitored patient vitals and documented care",
      "I educated families and coordinated with doctors"
    ]
  };

  const handleEnhance = async () => {
    if (!text.trim()) return;
    
    setIsLoading(true);
    try {
      const response = await fetch('/api/enhance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, industry, level })
      });
      
      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error('Enhancement failed:', error);
      setResult({ success: false, error: 'Enhancement failed' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!text.trim()) return;
    
    setIsLoading(true);
    try {
      const response = await fetch('/api/enhance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, industry, type: 'search' })
      });
      
      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error('Search failed:', error);
      setResult({ success: false, error: 'Search failed' });
    } finally {
      setIsLoading(false);
    }
  };

  const useSample = (sampleText: string) => {
    setText(sampleText);
    setResult(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🎯 Keyword Bank & Content Enhancement System
          </h1>
          <p className="text-gray-600">
            Test the new focused, industry-specific content enhancement with comprehensive keyword banks.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <div className="space-y-6">
            {/* Controls */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Settings</h2>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Industry:
                  </label>
                  <select
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  >
                    {industries.map(ind => (
                      <option key={ind} value={ind}>
                        {ind.charAt(0).toUpperCase() + ind.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Experience Level:
                  </label>
                  <select
                    value={level}
                    onChange={(e) => setLevel(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  >
                    {levels.map(lvl => (
                      <option key={lvl} value={lvl}>
                        {lvl.charAt(0).toUpperCase() + lvl.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Sample Texts */}
              <div className="mb-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Sample texts for {industry}:</p>
                <div className="space-y-2">
                  {(sampleTexts[industry as keyof typeof sampleTexts] || []).map((sample, index) => (
                    <button
                      key={index}
                      onClick={() => useSample(sample)}
                      className="w-full text-left text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-md transition-colors"
                    >
                      {sample}
                    </button>
                  ))}
                </div>
              </div>

              {/* Input Area */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Enter text to enhance or search:
                  </label>
                  <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Type your job description or search term..."
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 h-24 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-vertical"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-3">
                  <button
                    onClick={handleEnhance}
                    disabled={!text.trim() || isLoading}
                    className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-medium py-3 px-6 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? 'Enhancing...' : '✨ Enhance Text'}
                  </button>
                  
                  <button
                    onClick={handleSearch}
                    disabled={!text.trim() || isLoading}
                    className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? 'Searching...' : '🔍 Search Keywords'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Results Section */}
          <div className="space-y-6">
            {result && result.success && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  {result.type === 'search' ? '🔍 Keyword Search Results' : '✨ Enhancement Results'}
                </h2>

                {result.type === 'enhancement' && (
                  <div className="space-y-4">
                    {/* Original vs Enhanced */}
                    <div className="space-y-3">
                      <div>
                        <h3 className="text-sm font-medium text-gray-700 mb-1">Original:</h3>
                        <div className="p-3 bg-gray-50 rounded border text-gray-800 text-sm">
                          {result.original}
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-sm font-medium text-gray-700 mb-1">Enhanced:</h3>
                        <div className="p-3 bg-green-50 border border-green-200 rounded text-gray-800 text-sm">
                          {result.enhanced}
                        </div>
                      </div>
                    </div>

                    {/* Improvements */}
                    {result.improvements && result.improvements.length > 0 && (
                      <div>
                        <h3 className="text-sm font-medium text-gray-700 mb-2">Improvements Made:</h3>
                        <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                          {result.improvements.map((improvement: string, index: number) => (
                            <li key={index}>{improvement}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Suggestions */}
                    {result.suggestions && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {result.suggestions.actionVerbs.length > 0 && (
                          <div>
                            <h4 className="text-sm font-medium text-blue-700 mb-2">Action Verbs:</h4>
                            <div className="flex flex-wrap gap-1">
                              {result.suggestions.actionVerbs.map((verb: string, index: number) => (
                                <span key={index} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                  {verb}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {result.suggestions.skills.length > 0 && (
                          <div>
                            <h4 className="text-sm font-medium text-green-700 mb-2">Relevant Skills:</h4>
                            <div className="flex flex-wrap gap-1">
                              {result.suggestions.skills.slice(0, 8).map((skill: string, index: number) => (
                                <span key={index} className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                                  {skill}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Quantification Options */}
                    {result.quantificationOptions && Object.keys(result.quantificationOptions).length > 0 && (
                      <div>
                        <h3 className="text-sm font-medium text-gray-700 mb-2">Quantification Options:</h3>
                        <div className="grid grid-cols-2 gap-2">
                          {Object.entries(result.quantificationOptions).map(([key, values]: [string, any]) => (
                            <div key={key} className="text-sm">
                              <span className="font-medium text-purple-700 capitalize">{key}:</span>
                              <span className="ml-1 text-gray-600">{values.join(', ')}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {result.type === 'search' && (
                  <div className="space-y-4">
                    <div className="text-sm text-gray-600">
                      Search results for: <strong>"{result.query}"</strong> in <strong>{industry}</strong>
                    </div>
                    
                    {Object.entries(result.results).map(([category, items]: [string, any]) => (
                      items.length > 0 && (
                        <div key={category}>
                          <h4 className="text-sm font-medium text-gray-700 mb-2 capitalize">
                            {category.replace(/([A-Z])/g, ' $1').trim()}:
                          </h4>
                          <div className="flex flex-wrap gap-1">
                            {items.map((item: string, index: number) => (
                              <span key={index} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                {item}
                              </span>
                            ))}
                          </div>
                        </div>
                      )
                    ))}
                  </div>
                )}
              </div>
            )}

            {result && !result.success && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-700">Error: {result.error}</p>
              </div>
            )}
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-blue-900 mb-2">
            🧪 How to Test:
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-blue-800 mb-2">Text Enhancement:</h4>
              <ul className="list-disc list-inside space-y-1 text-blue-700 text-sm">
                <li>Select an industry (especially trades like plumbing, HVAC, electrical)</li>
                <li>Choose experience level</li>
                <li>Use sample text or enter your own simple description</li>
                <li>Click "Enhance Text" to see professional transformation</li>
                <li>Review improvements and keyword suggestions</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-blue-800 mb-2">Keyword Search:</h4>
              <ul className="list-disc list-inside space-y-1 text-blue-700 text-sm">
                <li>Enter a keyword or skill name</li>
                <li>Select industry for focused results</li>
                <li>Click "Search Keywords" to find related terms</li>
                <li>Use results to build better content</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

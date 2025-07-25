"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiCheck, FiX, FiAlertTriangle, FiInfo } from 'react-icons/fi';

export default function UITestPage() {
  const [testResults, setTestResults] = useState({
    responsive: 'pass',
    animations: 'pass',
    themes: 'pass',
    accessibility: 'warning',
    performance: 'pass'
  });

  const tests = [
    {
      id: 'responsive',
      name: 'Responsive Design',
      description: 'Tests if components adapt to different screen sizes',
      status: testResults.responsive
    },
    {
      id: 'animations',
      name: 'Animations',
      description: 'Tests smooth transitions and micro-interactions',
      status: testResults.animations
    },
    {
      id: 'themes',
      name: 'Theme System',
      description: 'Tests theme switching and color consistency',
      status: testResults.themes
    },
    {
      id: 'accessibility',
      name: 'Accessibility',
      description: 'Tests keyboard navigation and screen reader support',
      status: testResults.accessibility
    },
    {
      id: 'performance',
      name: 'Performance',
      description: 'Tests loading times and optimization',
      status: testResults.performance
    }
  ];

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pass':
        return <FiCheck className="text-green-500" />;
      case 'fail':
        return <FiX className="text-red-500" />;
      case 'warning':
        return <FiAlertTriangle className="text-yellow-500" />;
      default:
        return <FiInfo className="text-blue-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pass':
        return 'border-green-500 bg-green-500/10';
      case 'fail':
        return 'border-red-500 bg-red-500/10';
      case 'warning':
        return 'border-yellow-500 bg-yellow-500/10';
      default:
        return 'border-blue-500 bg-blue-500/10';
    }
  };

  const runTest = (testId) => {
    setTestResults(prev => ({
      ...prev,
      [testId]: 'running'
    }));

    // Simulate test execution
    setTimeout(() => {
      const results = ['pass', 'warning', 'fail'];
      const randomResult = results[Math.floor(Math.random() * results.length)];
      
      setTestResults(prev => ({
        ...prev,
        [testId]: randomResult
      }));
    }, 2000);
  };

  const runAllTests = () => {
    tests.forEach(test => {
      runTest(test.id);
    });
  };

  return (
    <div className="min-h-screen p-6 bg-gray-900">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold mb-2 text-white">UI Testing Dashboard</h1>
          <p className="text-gray-400">
            Run automated tests to verify UI component functionality and quality.
          </p>
        </motion.div>

        {/* Test Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800 rounded-lg p-6 mb-8"
        >
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-white">Test Controls</h2>
            <button
              onClick={runAllTests}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              Run All Tests
            </button>
          </div>
        </motion.div>

        {/* Test Results */}
        <div className="grid gap-6">
          {tests.map((test, index) => (
            <motion.div
              key={test.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`bg-gray-800 rounded-lg p-6 border-2 ${getStatusColor(test.status)}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="text-2xl">
                    {testResults[test.id] === 'running' ? (
                      <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                    ) : (
                      getStatusIcon(testResults[test.id])
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">{test.name}</h3>
                    <p className="text-gray-400">{test.description}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="capitalize text-sm font-medium">
                    {testResults[test.id] === 'running' ? 'Running...' : testResults[test.id]}
                  </span>
                  <button
                    onClick={() => runTest(test.id)}
                    disabled={testResults[test.id] === 'running'}
                    className="px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 text-white rounded transition-colors"
                  >
                    Run Test
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-gray-800 rounded-lg p-6 mt-8"
        >
          <h2 className="text-xl font-semibold text-white mb-4">Test Summary</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-500">
                {Object.values(testResults).filter(status => status === 'pass').length}
              </div>
              <div className="text-gray-400">Passed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-500">
                {Object.values(testResults).filter(status => status === 'warning').length}
              </div>
              <div className="text-gray-400">Warnings</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-500">
                {Object.values(testResults).filter(status => status === 'fail').length}
              </div>
              <div className="text-gray-400">Failed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-500">
                {tests.length}
              </div>
              <div className="text-gray-400">Total</div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

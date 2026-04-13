import React, { useState, useEffect } from 'react';
import { Plus, Clock, Clipboard, Star, Trash2, BookOpen, X, Loader2, CheckCircle } from 'lucide-react';
import { apiFetch, LoadingSpinner, Badge } from './CompanyDashboardUtils';

export const ExamsPage = ({ token, user, showToast }) => {
  const [exams, setExams] = useState([]);
  const [examResults, setExamResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showQuestionsModal, setShowQuestionsModal] = useState(false);
  const [selectedExam, setSelectedExam] = useState(null);
  const [formData, setFormData] = useState({ title: '', description: '', duration: 30, passingScore: 60, type: 'mcq', questions: [] });
  const [newQuestion, setNewQuestion] = useState({ question: '', options: ['', '', '', ''], correctAnswer: 0, points: 1 });

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    const [examsRes, resultsRes] = await Promise.all([apiFetch('/exams/company'), apiFetch('/exams/results')]);
    setExams(examsRes.data?.exams || examsRes.data?.data || []);
    setExamResults(resultsRes.data?.results || []);
    setLoading(false);
  };

  const handleCreateExam = async () => {
    if (!formData.title || formData.questions.length === 0) { showToast('Please add a title and at least one question', 'error'); return; }
    const res = await apiFetch('/exams/create', { method: 'POST', body: JSON.stringify(formData) });
    if (res.ok && res.data?.success) {
      showToast('Exam created successfully!', 'success');
      setShowCreateModal(false);
      setFormData({ title: '', description: '', duration: 30, passingScore: 60, type: 'mcq', questions: [] });
      fetchData();
    }
  };

  const handleAddQuestion = () => {
    if (!newQuestion.question) return;
    setFormData({ ...formData, questions: [...formData.questions, { ...newQuestion }] });
    setNewQuestion({ question: '', options: ['', '', '', ''], correctAnswer: 0, points: 1 });
  };

  const handleRemoveQuestion = (index) => setFormData({ ...formData, questions: formData.questions.filter((_, i) => i !== index) });

  const handleDeleteExam = async (examId) => {
    if (!confirm('Delete this exam?')) return;
    const res = await apiFetch(`/exam/${examId}`, { method: 'DELETE' });
    if (res.ok && res.data?.success) { showToast('Exam deleted', 'success'); fetchData(); }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Exams & Assessments</h1>
          <p className="text-gray-500">Create and manage online tests for applicants</p>
        </div>
        <button onClick={() => setShowCreateModal(true)} className="flex items-center gap-2 px-4 py-2 bg-indigo-500 text-white rounded-xl hover:bg-indigo-600 transition-all">
          <Plus className="w-4 h-4" /> Create Exam
        </button>
      </div>

      <div className="grid md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-4 text-white shadow-lg">
          <p className="text-sm opacity-80">Total Exams</p>
          <p className="text-2xl font-bold">{exams.length}</p>
        </div>
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl p-4 text-white shadow-lg">
          <p className="text-sm opacity-80">Results</p>
          <p className="text-2xl font-bold">{examResults.length}</p>
        </div>
        <div className="bg-gradient-to-r from-amber-500 to-orange-600 rounded-xl p-4 text-white shadow-lg">
          <p className="text-sm opacity-80">Passed</p>
          <p className="text-2xl font-bold">{examResults.filter(r => r.score >= r.passingScore).length}</p>
        </div>
        <div className="bg-gradient-to-r from-rose-500 to-pink-600 rounded-xl p-4 text-white shadow-lg">
          <p className="text-sm opacity-80">Failed</p>
          <p className="text-2xl font-bold">{examResults.filter(r => r.score < r.passingScore).length}</p>
        </div>
      </div>

      <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
        <div className="p-4 border-b border-gray-800">
          <h3 className="font-semibold text-white">Your Exams</h3>
        </div>
        {loading ? (
          <div className="p-12 text-center">
            <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mx-auto mb-3" />
            <p className="text-gray-500">Loading exams...</p>
          </div>
        ) : exams.length === 0 ? (
          <div className="p-12 text-center text-gray-500">No exams yet. Create your first exam!</div>
        ) : (
          <div className="divide-y divide-gray-800">
            {exams.map((exam) => (
              <div key={exam._id} className="p-4 hover:bg-gray-800/30 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-white">{exam.title}</h4>
                      <Badge color={exam.type === 'mcq' ? 'blue' : 'purple'} className={exam.type === 'mcq' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 'bg-purple-500/10 text-purple-400 border border-purple-500/20'}>
                        {exam.type?.toUpperCase() || 'MCQ'}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">{exam.description}</p>
                    <div className="flex gap-4 mt-2 text-xs text-gray-500">
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {exam.duration} min</span>
                      <span className="flex items-center gap-1"><Clipboard className="w-3 h-3" /> {exam.questions?.length || 0} questions</span>
                      <span className="flex items-center gap-1"><Star className="w-3 h-3" /> {exam.passingScore}% to pass</span>
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button 
                      onClick={() => { setSelectedExam(exam); setShowQuestionsModal(true); }} 
                      className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors" 
                      title="View Questions"
                    >
                      <BookOpen className="w-4 h-4 text-gray-400" />
                    </button>
                    <button 
                      onClick={() => handleDeleteExam(exam._id)} 
                      className="p-2 bg-red-500/10 hover:bg-red-500/20 rounded-lg transition-colors" 
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
        <div className="p-4 border-b border-gray-800">
          <h3 className="font-semibold text-white">Results Dashboard</h3>
        </div>
        {examResults.length === 0 ? (
          <div className="p-12 text-center text-gray-500">No results yet</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-800/50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm text-gray-400">Candidate</th>
                  <th className="px-4 py-3 text-left text-sm text-gray-400">Exam</th>
                  <th className="px-4 py-3 text-left text-sm text-gray-400">Score</th>
                  <th className="px-4 py-3 text-left text-sm text-gray-400">Status</th>
                  <th className="px-4 py-3 text-left text-sm text-gray-400">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {examResults.map((result) => (
                  <tr key={result._id} className="hover:bg-gray-800/30">
                    <td className="px-4 py-3 text-gray-300">{result.candidateName || 'N/A'}</td>
                    <td className="px-4 py-3 text-gray-400">{result.examTitle || 'N/A'}</td>
                    <td className="px-4 py-3 font-medium text-white">{result.score}%</td>
                    <td className="px-4 py-3">
                      <Badge color={result.score >= result.passingScore ? 'green' : 'red'}>
                        {result.score >= result.passingScore ? 'Passed' : 'Failed'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">{new Date(result.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-gray-800 shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-white">Create New Exam</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Exam Title *</label>
                <input 
                  type="text" 
                  value={formData.title} 
                  onChange={(e) => setFormData({...formData, title: e.target.value})} 
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
                <textarea 
                  value={formData.description} 
                  onChange={(e) => setFormData({...formData, description: e.target.value})} 
                  rows={2} 
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500" 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Duration (min)</label>
                  <input 
                    type="number" 
                    value={formData.duration} 
                    onChange={(e) => setFormData({...formData, duration: parseInt(e.target.value)})} 
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Passing Score (%)</label>
                  <input 
                    type="number" 
                    value={formData.passingScore} 
                    onChange={(e) => setFormData({...formData, passingScore: parseInt(e.target.value)})} 
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" 
                  />
                </div>
              </div>
              <div className="border-t border-gray-800 pt-4">
                <h4 className="font-medium text-white mb-2">Questions ({formData.questions.length})</h4>
                {formData.questions.map((q, i) => (
                  <div key={i} className="bg-gray-800/50 p-3 rounded-lg mb-2 border border-gray-700">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-300">{i + 1}. {q.question}</span>
                      <button onClick={() => handleRemoveQuestion(i)} className="text-red-400 hover:text-red-300">✕</button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Answer: {q.options[q.correctAnswer]}</p>
                  </div>
                ))}
              </div>
              <div className="border border-gray-700 p-4 rounded-xl bg-gray-800/30">
                <h5 className="font-medium text-white mb-2">Add Question</h5>
                <div className="mb-2">
                  <input 
                    type="text" 
                    value={newQuestion.question} 
                    onChange={(e) => setNewQuestion({...newQuestion, question: e.target.value})} 
                    placeholder="Enter question" 
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500" 
                  />
                </div>
                {newQuestion.options.map((opt, i) => (
                  <div key={i} className="flex items-center gap-2 mb-1">
                    <input 
                      type="radio" 
                      name="correctAnswer" 
                      checked={newQuestion.correctAnswer === i} 
                      onChange={() => setNewQuestion({...newQuestion, correctAnswer: i})} 
                      className="text-indigo-500"
                    />
                    <input 
                      type="text" 
                      value={opt} 
                      onChange={(e) => { const opts = [...newQuestion.options]; opts[i] = e.target.value; setNewQuestion({...newQuestion, options: opts}); }} 
                      placeholder={`Option ${i + 1}`} 
                      className="flex-1 px-3 py-1 bg-gray-700 border border-gray-600 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500" 
                    />
                  </div>
                ))}
                <button 
                  onClick={handleAddQuestion} 
                  className="mt-2 text-sm text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" /> Add Question
                </button>
              </div>
              <button 
                onClick={handleCreateExam} 
                className="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl font-medium hover:from-indigo-600 hover:to-purple-600"
              >
                Create Exam
              </button>
            </div>
          </div>
        </div>
      )}

      {showQuestionsModal && selectedExam && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-gray-800 shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-white">{selectedExam.title} - Questions</h3>
              <button onClick={() => setShowQuestionsModal(false)} className="text-gray-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3">
              {selectedExam.questions?.map((q, i) => (
                <div key={i} className="p-3 bg-gray-800/50 rounded-lg border border-gray-700">
                  <p className="font-medium text-white">{i + 1}. {q.question}</p>
                  <div className="mt-2 space-y-1">
                    {q.options?.map((opt, j) => (
                      <p key={j} className={`text-sm ${j === q.correctAnswer ? 'text-green-400 font-medium' : 'text-gray-500'}`}>
                        {j === q.correctAnswer && <CheckCircle className="w-3 h-3 inline mr-1" />}
                        {opt}
                      </p>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExamsPage;

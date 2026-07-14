import { useState, useEffect } from 'react';
import { STEP_CONFIGS } from '../../data/stepConfig';
import { input as inp, btnPrimary, btnGhost, label as lbl } from '../theme';
import { saveCustomQuestion, fetchCustomQuestions, deleteCustomQuestion, type CustomQuestionConfig, type PricingRule, type CustomQuestionRecord } from '../../lib/customQuestionsStore';
import type { QuestionConfig } from '../../types/form';

const PATH_MAP = STEP_CONFIGS;

function flatten(qs: QuestionConfig[]): QuestionConfig[] {
  return qs.flatMap(q => [q, ...(q.children ? flatten(q.children) : [])]);
}

export default function AdminAddQuestion() {
  const [questions, setQuestions] = useState<CustomQuestionRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [path, setPath] = useState<'drywall' | 'trim' | 'paint'>('drywall');
  const [insertAfter, setInsertAfter] = useState<string>('');
  
  const [id, setId] = useState(`custom_${Date.now()}`);
  const [label, setLabel] = useState('');
  const [type, setType] = useState<'dropdown' | 'number' | 'text' | 'photoUpload'>('dropdown');
  const [required, setRequired] = useState(false);
  
  // For Dropdown
  const [options, setOptions] = useState<string[]>(['Yes', 'No']);
  const [pricing, setPricing] = useState<Record<string, PricingRule>>({});
  
  // For Conditions (Sub-questions)
  const [hasCondition, setHasCondition] = useState(false);
  const [condField, setCondField] = useState('');
  const [condValue, setCondValue] = useState('');

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const baseQuestions = flatten(PATH_MAP[path]);
  const customPathQuestions = questions.filter(q => q.path === path).map(q => q.config);
  const currentQuestions = [...baseQuestions, ...customPathQuestions];

  useEffect(() => {
    loadQuestions();
  }, []);

  const loadQuestions = async () => {
    setLoading(true);
    const data = await fetchCustomQuestions();
    setQuestions(data);
    setLoading(false);
  };

  const handleDelete = async (recordId: string) => {
    if (!window.confirm("Are you sure you want to delete this custom question?")) return;
    try {
      await deleteCustomQuestion(recordId);
      loadQuestions();
    } catch (e: any) {
      alert(`Error deleting: ${e.message}`);
    }
  };

  const handleEdit = (q: CustomQuestionRecord) => {
    setEditingId(q.id);
    setPath(q.path);
    setInsertAfter(q.insert_after_id || '');
    setId(q.config.id);
    setLabel(q.config.label || '');
    setType(q.config.type as any);
    setRequired(!!q.config.required);
    
    if (q.config.type === 'dropdown' && q.config.options) {
      setOptions(q.config.options.filter(o => o.trim() !== ''));
    } else {
      setOptions(['Yes', 'No']);
    }

    setPricing(q.config.pricingRules || {});

    if (q.config.condition) {
      setHasCondition(true);
      setCondField(q.config.condition.field);
      setCondValue(q.config.condition.is as string || '');
    } else {
      setHasCondition(false);
      setCondField('');
      setCondValue('');
    }
    
    // Scroll to form
    document.getElementById('question-form')?.scrollIntoView({ behavior: 'smooth' });
  };

  const resetForm = () => {
    setEditingId(null);
    setId(`custom_${Date.now()}`);
    setLabel('');
    setOptions(['Yes', 'No']);
    setPricing({});
    setHasCondition(false);
    setCondField('');
    setCondValue('');
  };

  const handleOptionChange = (idx: number, val: string) => {
    const next = [...options];
    next[idx] = val;
    setOptions(next);
  };

  const handlePriceChange = (option: string, type: 'flat' | 'per_unit', amount: number) => {
    setPricing(prev => ({
      ...prev,
      [option]: { type, amount }
    }));
  };

  const handleSubmit = async () => {
    if (!label.trim()) {
      setMessage("Label is required.");
      return;
    }
    
    setSaving(true);
    setMessage('');

    const config: CustomQuestionConfig = {
      id,
      label,
      type,
      required,
    };

    if (type === 'dropdown') {
      config.options = ['', ...options.filter(o => o.trim() !== '')];
    } else if (type === 'number' || type === 'text') {
      config.placeholder = type === 'number' ? 'amount' : 'text...';
    } else if (type === 'photoUpload') {
      config.multiple = true;
    }

    if (hasCondition && condField) {
      config.condition = { field: condField, is: condValue };
    }

    if (Object.keys(pricing).length > 0) {
      config.pricingRules = pricing;
    }

    try {
      await saveCustomQuestion({
        id: editingId || undefined,
        path,
        insert_after_id: insertAfter || null,
        config,
      });
      setMessage(editingId ? 'Question updated successfully!' : 'Question added successfully!');
      resetForm();
      loadQuestions();
    } catch (e: any) {
      setMessage(`Error: ${e.message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-12 pb-20">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Custom Questions</h1>
        <p className="text-sm text-slate-500 mt-1">
          Manage dynamic questions and their optional pricing rules.
        </p>
      </div>

      {/* Existing Questions List */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-800">Existing Custom Questions</h2>
        {loading ? (
          <p className="text-sm text-slate-500">Loading...</p>
        ) : questions.length === 0 ? (
          <p className="text-sm text-slate-500 italic bg-white p-4 rounded-lg border border-slate-200">No custom questions added yet.</p>
        ) : (
          <div className="grid gap-4">
            {questions.map(q => (
              <div key={q.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#2F9BF0] bg-[#2F9BF0]/10 px-2 py-0.5 rounded-full">{q.path}</span>
                    <span className="text-sm font-semibold text-slate-900">{q.config.label}</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Type: {q.config.type} | ID: {q.config.id}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleEdit(q)} className="text-xs font-medium text-slate-600 hover:text-[#2F9BF0] bg-slate-100 hover:bg-[#2F9BF0]/10 px-3 py-1.5 rounded-md transition-colors">Edit</button>
                  <button onClick={() => handleDelete(q.id)} className="text-xs font-medium text-red-600 hover:text-white bg-red-50 hover:bg-red-500 px-3 py-1.5 rounded-md transition-colors">Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div id="question-form" className="space-y-6 bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <h2 className="text-lg font-semibold text-slate-800">{editingId ? 'Edit Custom Question' : 'Add New Question'}</h2>
          {editingId && (
            <button onClick={resetForm} className="text-xs font-medium text-slate-500 hover:text-slate-700">Cancel Edit</button>
          )}
        </div>
        
        {/* Placement */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={lbl}>Service Page</label>
            <select className={inp} value={path} onChange={(e: any) => setPath(e.target.value)}>
              <option value="drywall">Drywall</option>
              <option value="trim">Trim & Baseboard</option>
              <option value="paint">Painting</option>
            </select>
          </div>
          <div>
            <label className={lbl}>Insert After...</label>
            <select className={inp} value={insertAfter} onChange={e => setInsertAfter(e.target.value)}>
              <option value="">-- At the very end --</option>
              {currentQuestions.filter(q => q.label).map(q => (
                <option key={q.id} value={q.id}>{q.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Basic Info */}
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className={lbl}>Question Label / Text</label>
            <input className={inp} value={label} onChange={e => setLabel(e.target.value)} placeholder="e.g. Do you need custom finishing?" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={lbl}>Type</label>
            <select className={inp} value={type} onChange={(e: any) => setType(e.target.value)}>
              <option value="dropdown">Dropdown Options</option>
              <option value="number">Numeric Input</option>
              <option value="text">Text Input</option>
              <option value="photoUpload">Photo Upload</option>
            </select>
          </div>
          <div className="flex items-center gap-2 mt-6">
            <input type="checkbox" checked={required} onChange={e => setRequired(e.target.checked)} className="h-4 w-4" />
            <label className="text-sm text-slate-700">Make this question required</label>
          </div>
        </div>

        {/* Sub-question Condition */}
        <div className="border border-slate-100 bg-slate-50 p-4 rounded-lg space-y-3">
          <div className="flex items-center gap-2">
            <input type="checkbox" checked={hasCondition} onChange={e => setHasCondition(e.target.checked)} className="h-4 w-4" />
            <label className="text-sm font-semibold text-slate-700">This is a conditional sub-question</label>
          </div>
          {hasCondition && (
            <div className="grid grid-cols-2 gap-4 pl-6">
              <div>
                <label className={lbl}>If previous question...</label>
                <select className={inp} value={condField} onChange={e => setCondField(e.target.value)}>
                  <option value="">-- Select Question --</option>
                  {currentQuestions.map(q => <option key={q.id} value={q.id}>{q.id}</option>)}
                </select>
              </div>
              <div>
                <label className={lbl}>Equals value...</label>
                <input className={inp} value={condValue} onChange={e => setCondValue(e.target.value)} placeholder="e.g. Yes" />
              </div>
            </div>
          )}
        </div>

        {/* Options & Pricing for Dropdown */}
        {type === 'dropdown' && (
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-700 border-b pb-2">Options & Pricing</h3>
            {options.map((opt, idx) => (
              <div key={idx} className="flex items-center gap-3 bg-slate-50 p-3 rounded-lg border border-slate-100">
                <div className="flex-1">
                  <label className="text-xs text-slate-500">Option Text</label>
                  <input className={inp} value={opt} onChange={e => handleOptionChange(idx, e.target.value)} />
                </div>
                
                <div className="w-32">
                  <label className="text-xs text-slate-500">Price Type</label>
                  <select className={inp} value={pricing[opt]?.type || 'flat'} onChange={e => handlePriceChange(opt, e.target.value as any, pricing[opt]?.amount || 0)}>
                    <option value="flat">Flat Fee ($)</option>
                    <option value="per_unit">Per Sqft/Lft</option>
                  </select>
                </div>
                
                <div className="w-24">
                  <label className="text-xs text-slate-500">Amount</label>
                  <input className={inp} type="number" min="0" step="0.5" value={pricing[opt]?.amount || ''} onChange={e => handlePriceChange(opt, pricing[opt]?.type || 'flat', parseFloat(e.target.value) || 0)} />
                </div>
                
                <button type="button" onClick={() => setOptions(options.filter((_, i) => i !== idx))} className="mt-5 text-red-500 text-sm hover:underline">Remove</button>
              </div>
            ))}
            <button type="button" onClick={() => setOptions([...options, ''])} className={btnGhost}>+ Add Option</button>
          </div>
        )}

        {/* Options & Pricing for Number */}
        {type === 'number' && (
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-700 border-b pb-2">Multiplier Pricing (Optional)</h3>
            <p className="text-xs text-slate-500">If the user enters a number here (e.g. 10 sqft), you can multiply it by a dollar amount.</p>
            <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-lg border border-slate-100">
              <div className="w-48">
                <label className="text-xs text-slate-500">Amount per unit entered</label>
                <input className={inp} type="number" min="0" step="0.5" value={pricing['multiplier']?.amount || ''} onChange={e => handlePriceChange('multiplier', 'per_unit', parseFloat(e.target.value) || 0)} />
              </div>
            </div>
          </div>
        )}

        {/* Submit */}
        <div className="pt-4 flex items-center justify-between border-t border-slate-100">
          <span className="text-sm font-medium text-emerald-600">{message}</span>
          <button onClick={handleSubmit} disabled={saving} className={btnPrimary}>
            {saving ? 'Saving...' : (editingId ? 'Save Changes' : 'Add Question')}
          </button>
        </div>
      </div>
    </div>
  );
}

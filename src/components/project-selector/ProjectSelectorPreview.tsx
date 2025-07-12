import React, { useState } from 'react';
import { Search, Play } from 'lucide-react';

const mockProjects = [
  { id: '1', name: 'Personal' },
  { id: '2', name: 'Work' },
  { id: '3', name: 'Study' },
  { id: '4', name: 'Fitness' },
  { id: '5', name: 'Travel' },
];
const mockSubprojects = [
  { id: 'a', name: 'Exercise' },
  { id: 'b', name: 'Reading' },
  { id: 'c', name: 'Learning' },
  { id: 'd', name: 'Meetings' },
  { id: 'e', name: 'Planning' },
];
const mockCombos = [
  { id: 'c1', project: 'Personal', subproject: 'Exercise' },
  { id: 'c2', project: 'Work', subproject: 'Meetings' },
  { id: 'c3', project: 'Study', subproject: 'Reading' },
  { id: 'c4', project: 'Fitness', subproject: 'Exercise' },
];

export default function ProjectSelectorPreview() {
  const [selectedProjectId, setSelectedProjectId] = useState('1');
  const [selectedSubprojectId, setSelectedSubprojectId] = useState('a');
  const [projectDropdown, setProjectDropdown] = useState(false);
  const [subprojectDropdown, setSubprojectDropdown] = useState(false);
  const [projectSearch, setProjectSearch] = useState('');
  const [subprojectSearch, setSubprojectSearch] = useState('');

  const filteredProjects = mockProjects.filter(p =>
    p.name.toLowerCase().includes(projectSearch.toLowerCase())
  );
  const filteredSubprojects = mockSubprojects.filter(s =>
    s.name.toLowerCase().includes(subprojectSearch.toLowerCase())
  );

  return (
    <div className="bg-white rounded-3xl shadow-xl p-8 w-full max-w-md mx-auto flex flex-col space-y-8">
      {/* Project Search */}
      <div className="space-y-2">
        <label className="text-xs uppercase tracking-wider text-neutral-400 font-semibold">Project</label>
        <div className="relative">
          <input
            className="w-full bg-white border border-neutral-200 rounded-xl py-3 pl-12 pr-4 shadow-sm text-neutral-900 placeholder:text-neutral-400 focus:border-black focus:ring-1 focus:ring-black transition"
            placeholder="Search projects..."
            value={projectSearch}
            onChange={e => setProjectSearch(e.target.value)}
            onFocus={() => setProjectDropdown(true)}
            onBlur={() => setTimeout(() => setProjectDropdown(false), 150)}
            readOnly={false}
          />
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 w-5 h-5" />
          {projectDropdown && (
            <div className="absolute left-0 right-0 mt-2 bg-white border border-neutral-200 rounded-xl shadow-lg z-10">
              <input
                className="w-full px-4 py-2 border-b border-neutral-100 text-neutral-900 placeholder:text-neutral-400 focus:outline-none"
                placeholder="Filter projects..."
                value={projectSearch}
                onChange={e => setProjectSearch(e.target.value)}
                autoFocus
              />
              <div className="max-h-56 overflow-y-auto">
                {filteredProjects.map(p => (
                  <div
                    key={p.id}
                    className={`px-4 py-3 cursor-pointer transition ${
                      selectedProjectId === p.id
                        ? 'bg-neutral-200 font-semibold'
                        : 'hover:bg-neutral-100'
                    }`}
                    onMouseDown={() => {
                      setSelectedProjectId(p.id);
                      setProjectDropdown(false);
                    }}
                  >
                    {p.name}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Subproject Search */}
      <div className="space-y-2">
        <label className="text-xs uppercase tracking-wider text-neutral-400 font-semibold">Subproject</label>
        <div className="relative">
          <input
            className="w-full bg-white border border-neutral-200 rounded-xl py-3 pl-12 pr-4 shadow-sm text-neutral-900 placeholder:text-neutral-400 focus:border-black focus:ring-1 focus:ring-black transition"
            placeholder="Search subprojects..."
            value={subprojectSearch}
            onChange={e => setSubprojectSearch(e.target.value)}
            onFocus={() => setSubprojectDropdown(true)}
            onBlur={() => setTimeout(() => setSubprojectDropdown(false), 150)}
            readOnly={false}
          />
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 w-5 h-5" />
          {subprojectDropdown && (
            <div className="absolute left-0 right-0 mt-2 bg-white border border-neutral-200 rounded-xl shadow-lg z-10">
              <input
                className="w-full px-4 py-2 border-b border-neutral-100 text-neutral-900 placeholder:text-neutral-400 focus:outline-none"
                placeholder="Filter subprojects..."
                value={subprojectSearch}
                onChange={e => setSubprojectSearch(e.target.value)}
                autoFocus
              />
              <div className="max-h-56 overflow-y-auto">
                {filteredSubprojects.map(s => (
                  <div
                    key={s.id}
                    className={`px-4 py-3 cursor-pointer transition ${
                      selectedSubprojectId === s.id
                        ? 'bg-neutral-200 font-semibold'
                        : 'hover:bg-neutral-100'
                    }`}
                    onMouseDown={() => {
                      setSelectedSubprojectId(s.id);
                      setSubprojectDropdown(false);
                    }}
                  >
                    {s.name}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Frequent Projects */}
      <div>
        <label className="text-xs uppercase tracking-wider text-neutral-400 font-semibold mb-2 block">Frequent Projects</label>
        <div className="flex flex-wrap gap-3">
          {mockProjects.slice(0, 4).map(p => (
            <button
              key={p.id}
              className={`px-5 py-2 rounded-full font-medium transition text-base ${
                selectedProjectId === p.id
                  ? 'bg-black text-white shadow'
                  : 'bg-neutral-100 text-neutral-700'
              } hover:bg-neutral-200`}
              onClick={() => setSelectedProjectId(p.id)}
            >
              {p.name}
            </button>
          ))}
        </div>
      </div>

      {/* Frequent Subprojects */}
      <div>
        <label className="text-xs uppercase tracking-wider text-neutral-400 font-semibold mb-2 block">Frequent Subprojects</label>
        <div className="flex flex-wrap gap-3">
          {mockSubprojects.slice(0, 4).map(s => (
            <button
              key={s.id}
              className={`px-5 py-2 rounded-full font-medium transition text-base ${
                selectedSubprojectId === s.id
                  ? 'bg-black text-white shadow'
                  : 'bg-neutral-100 text-neutral-700'
              } hover:bg-neutral-200`}
              onClick={() => setSelectedSubprojectId(s.id)}
            >
              {s.name}
            </button>
          ))}
        </div>
      </div>

      {/* Frequent Combos */}
      <div>
        <label className="text-xs uppercase tracking-wider text-neutral-400 font-semibold mb-2 block">Top Combos</label>
        <div className="flex flex-wrap gap-3">
          {mockCombos.slice(0, 4).map(combo => (
            <button
              key={combo.id}
              className="flex items-center gap-2 px-5 py-2 rounded-full bg-neutral-100 text-neutral-700 hover:bg-neutral-200 transition font-medium border border-neutral-200"
              onClick={() => alert(`Start timer for ${combo.project} / ${combo.subproject}`)}
            >
              <Play className="w-4 h-4 text-black/60" />
              {combo.project} <span className="text-neutral-400">/</span> {combo.subproject}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
} 
"use client";
/* eslint-disable */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { UserCircle, ShieldCheck, Trash2, Loader2, PlusCircle, Edit2, Save, X, Check, ChevronDown } from 'lucide-react';
import { useTheme } from '@/lib/theme-context';

interface User {
  id: number;
  username: string;
  role: 'admin' | 'staff';
  teams?: string | string[]; // Can be JSON string or array
  adserView?: string | string[]; // Can be JSON string or array
  createdAt: string;
}

interface EditingUser extends User {
  newPassword?: string;
}

// Custom Multi-Select Dropdown Component
const MultiSelectDropdown = ({ options, selectedValues, onChange, placeholder = "เลือกทีม" }: {
  options: string[];
  selectedValues: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
  const dropdownRef = useRef<HTMLDivElement>(null);
  const dropdownContentRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        dropdownRef.current && !dropdownRef.current.contains(target) &&
        dropdownContentRef.current && !dropdownContentRef.current.contains(target)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && dropdownRef.current) {
      const rect = dropdownRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + window.scrollY + 4,
        left: rect.left + window.scrollX,
        width: rect.width
      });
    }
  }, [isOpen]);

  const handleToggleOption = useCallback((option: string) => {
    const newValues = selectedValues.includes(option)
      ? selectedValues.filter(v => v !== option)
      : [...selectedValues, option];
    onChange(newValues);
  }, [selectedValues, onChange]);

  const getDisplayText = () => {
    if (selectedValues.length === 0) return placeholder;
    if (selectedValues.length === 1) return selectedValues[0];
    return `เลือกแล้ว ${selectedValues.length} ทีม`;
  };

  const dropdownContent = (
    <div 
      ref={dropdownContentRef}
      className="fixed bg-white dark:bg-slate-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-xl max-h-48 overflow-y-auto"
      style={{ 
        top: dropdownPosition.top,
        left: dropdownPosition.left,
        width: dropdownPosition.width,
        zIndex: 99999
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {options.map(option => (
        <div
          key={option}
          className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 dark:hover:bg-slate-600 cursor-pointer"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleToggleOption(option);
          }}
        >
          <input
            type="checkbox"
            checked={selectedValues.includes(option)}
            onChange={() => {}} // Controlled by parent div click
            className="w-4 h-4 text-blue-600 focus:ring-blue-500 rounded cursor-pointer pointer-events-none"
            tabIndex={-1}
          />
          <span className="text-sm text-gray-900 dark:text-white cursor-pointer select-none">
            {option}
          </span>
        </div>
      ))}
    </div>
  );

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className="w-full border border-gray-300 dark:border-gray-600 px-3 py-2 rounded-md text-left focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-sm bg-white dark:bg-slate-700 dark:text-white flex items-center justify-between"
      >
        <span className={selectedValues.length === 0 ? "text-gray-500 dark:text-gray-400" : "text-gray-900 dark:text-white"}>
          {getDisplayText()}
        </span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      
      {isOpen && mounted && typeof window !== 'undefined' && createPortal(
        dropdownContent,
        document.body
      )}
    </div>
  );
};

export default function UserManagement() {
  const { colors } = useTheme();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ username: '', password: '', role: 'staff', teams: [] as string[] });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [editingUser, setEditingUser] = useState<EditingUser | null>(null);
  const [adserOptions, setAdserOptions] = useState<string[]>([]);
  const [teamOptions, setTeamOptions] = useState<string[]>([]);
  const [teamAdvertiserMapping, setTeamAdvertiserMapping] = useState<{[key: string]: string[]}>({});
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  // Helper functions to handle string/array conversion
  const parseJsonField = (field: string | string[] | undefined): string[] => {
    if (!field) return [];
    if (Array.isArray(field)) return field;
    try {
      const parsed = JSON.parse(field);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  };

  const getTeamsArray = (user: User | EditingUser): string[] => {
    return parseJsonField(user.teams);
  };

  const getAdserViewArray = (user: User | EditingUser): string[] => {
    return parseJsonField(user.adserView);
  };

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch users');
      setUsers(data.users);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  const fetchAdserOptions = async () => {
    try {
      const res = await fetch('/api/filters');
      const data = await res.json();
      if (res.ok && data.adsers && data.teams && data.teamAdvertiserMapping) {
        setAdserOptions(data.adsers);
        setTeamOptions(data.teams);
        setTeamAdvertiserMapping(data.teamAdvertiserMapping);
      }
    } catch (err) {
      console.error('Failed to fetch filter options:', err);
      // Fallback to default options if API fails
      setAdserOptions(['Boogey', 'Bubble', 'Netflix', 'Apple', 'Google', 'Facebook']);
      setTeamOptions(['HCA', 'HCB', 'HCC', 'TED', 'ADV', 'ENG']);
      setTeamAdvertiserMapping({
        'HCA': ['Boogey', 'Bubble', 'Netflix'],
        'HCB': ['Apple', 'Google'],
        'HCC': ['Facebook'],
        'TED': ['Boogey', 'Apple'],
        'ADV': ['Netflix', 'Google'],
        'ENG': ['Bubble', 'Facebook']
      });
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchAdserOptions();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.username || !form.password) return;
    setLoading(true);
    setError('');
    try {
      const payload = form.role === 'admin' 
        ? { ...form, teams: [] } // แอดมินไม่ต้องกำหนดทีม
        : { ...form }; // พนักงานใช้ทีมที่เลือก
      
      const res = await fetch('/api/auth/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create user');
      setForm({ username: '', password: '', role: 'staff', teams: [] });
      fetchUsers();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create user');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('คุณแน่ใจหรือไม่ที่จะลบผู้ใช้นี้?')) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/users', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ id })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete user');
      fetchUsers();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to delete user');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveEdit = async () => {
    if (!editingUser) return;
    setLoading(true);
    setError('');
    try {
      const updateData: {
        id: number;
        adserView: string | string[];
        teams: string | string[];
        password?: string;
      } = {
        id: editingUser.id,
        adserView: editingUser.adserView || [],
        teams: editingUser.role === 'admin' ? [] : (editingUser.teams || [])
      };
      if (editingUser.newPassword) {
        updateData.password = editingUser.newPassword;
      }
      const res = await fetch('/api/auth/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(updateData)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update user');
      setEditingUser(null);
      fetchUsers();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to update user');
    } finally {
      setLoading(false);
    }
  };

  const toggleAdser = (adserName: string) => {
    if (!editingUser) return;
    const adserView = getAdserViewArray(editingUser);
    const newAdserView = adserView.includes(adserName)
      ? adserView.filter((a: string) => a !== adserName)
      : [...adserView, adserName];
    setEditingUser({ ...editingUser, adserView: newAdserView });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div 
            className="p-2 rounded-lg"
            style={{ backgroundColor: colors.primary }}
          >
            <UserCircle className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200">จัดการผู้ใช้งาน</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">เพิ่ม แก้ไข และจัดการผู้ใช้ในระบบ</p>
          </div>
        </div>
      </div>

        {error && (
          <div className="mb-3 bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg flex items-center gap-2 text-sm">
            <X className="w-4 h-4" />
            {error}
          </div>
        )}

        {/* Create User Form */}
        <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-lg shadow-lg border border-white/20 mb-3">
          <div 
            className="px-3 py-2 rounded-t-lg"
            style={{ background: `linear-gradient(135deg, ${colors.primary}, ${colors.primary}dd)` }}
          >
            <h2 className="text-base font-semibold text-white flex items-center gap-2">
              <PlusCircle className="w-4 h-4" />
              เพิ่มผู้ใช้ใหม่
            </h2>
          </div>
          <div className="p-3">
            <form onSubmit={handleCreate} className="space-y-2">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-2">
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">ชื่อผู้ใช้</label>
                  <input 
                    placeholder="Username" 
                    value={form.username} 
                    onChange={e => setForm(f => ({ ...f, username: e.target.value }))} 
                    className="w-full border border-gray-300 dark:border-gray-600 px-3 py-2 rounded-md focus:ring-2 focus:border-transparent transition text-sm bg-white/80 dark:bg-slate-700/80" 
                    style={{ 
                      '--tw-ring-color': colors.primary,
                      focusVisible: { borderColor: colors.primary }
                    } as React.CSSProperties}
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">รหัสผ่าน</label>
                  <input 
                    placeholder="Password" 
                    type="password" 
                    value={form.password} 
                    onChange={e => setForm(f => ({ ...f, password: e.target.value }))} 
                    className="w-full border border-gray-300 dark:border-gray-600 px-3 py-2 rounded-md focus:ring-2 focus:border-transparent transition text-sm bg-white/80 dark:bg-slate-700/80" 
                    style={{ 
                      '--tw-ring-color': colors.primary,
                      focusVisible: { borderColor: colors.primary }
                    } as React.CSSProperties}
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">บทบาท</label>
                  <select 
                    value={form.role} 
                    onChange={e => setForm(f => ({ ...f, role: e.target.value }))} 
                    className="w-full border border-gray-300 dark:border-gray-600 px-3 py-2 rounded-md focus:ring-2 focus:border-transparent transition text-sm bg-white/80 dark:bg-slate-700/80"
                    style={{ 
                      '--tw-ring-color': colors.primary,
                      focusVisible: { borderColor: colors.primary }
                    } as React.CSSProperties}
                  >
                    <option value="staff">พนักงาน</option>
                    <option value="admin">ผู้ดูแลระบบ</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">ทีม</label>
                  {form.role === 'admin' ? (
                    <div className="w-full border border-gray-300 dark:border-gray-600 px-3 py-2 rounded-md bg-gray-50 dark:bg-slate-700 text-gray-600 dark:text-gray-400 text-sm">
                      ดูได้ทุกทีม (แอดมิน)
                    </div>
                  ) : (
                    <MultiSelectDropdown
                      options={teamOptions}
                      selectedValues={form.teams}
                      onChange={(values) => setForm(f => ({ ...f, teams: values }))}
                      placeholder="เลือกทีม"
                    />
                  )}
                </div>
                <div className="flex items-end">
                  <button 
                    type="submit" 
                    className="w-full flex items-center justify-center gap-2 text-white px-4 py-2 rounded-md font-semibold shadow-lg transition disabled:opacity-50 text-sm hover:opacity-90 transform hover:scale-105" 
                    style={{ 
                      background: `linear-gradient(135deg, ${colors.primary}, ${colors.primary}dd)` 
                    }}
                    disabled={loading}
                  >
                    {loading ? <Loader2 className="animate-spin w-4 h-4" /> : <PlusCircle className="w-4 h-4" />}
                    {loading ? 'กำลังเพิ่ม...' : 'เพิ่มผู้ใช้'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* Users List */}
        <div className="space-y-3">
          <div className="mb-2">
            <h2 className="text-lg font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2">
              <ShieldCheck 
                className="w-5 h-5" 
                style={{ color: colors.primary }}
              />
              รายการผู้ใช้งาน
            </h2>
          </div>
          
          <div className="space-y-2">
            {users.map(u => (
              <div key={u.id} className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-lg shadow-md p-3 border border-white/20 hover:shadow-lg transition">
                {editingUser && editingUser.id === u.id ? (
                  // Edit Mode
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <UserCircle className={`w-8 h-8`} style={{ color: u.role === 'admin' ? colors.primary : '#9CA3AF' }} />
                      <div className="flex-1">
                        <div className="font-bold text-base text-gray-800 dark:text-gray-200 flex items-center gap-2">
                          {u.username}
                          {u.role === 'admin' && <ShieldCheck className="w-3 h-3" style={{ color: colors.primary }} />}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">{u.role === 'admin' ? 'แอดมิน' : 'พนักงาน'}</div>
                      </div>
                      <div className="flex gap-1">
                        <button 
                          onClick={handleSaveEdit} 
                          className="flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded text-xs font-medium transition" 
                          disabled={loading}
                        >
                          <Check className="w-3 h-3" />
                          บันทึก
                        </button>
                        <button 
                          onClick={() => setEditingUser(null)} 
                          className="flex items-center gap-1 bg-gray-500 hover:bg-gray-600 text-white px-2 py-1 rounded text-xs font-medium transition"
                        >
                          <X className="w-3 h-3" />
                          ยกเลิก
                        </button>
                      </div>
                    </div>
                    
                    {/* เลือกทีม */}
                    <div className="border-t pt-2">
                      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">เลือกทีม:</label>
                      {editingUser.role === 'admin' ? (
                        <div className="w-full max-w-md border border-gray-300 dark:border-gray-600 px-2 py-1 rounded-md bg-gray-50 dark:bg-slate-700 text-gray-600 dark:text-gray-400 text-xs">
                          ดูได้ทุกทีม (แอดมิน)
                        </div>
                      ) : (
                        <div className="max-w-md">
                          <MultiSelectDropdown
                            options={teamOptions}
                            selectedValues={getTeamsArray(editingUser)}
                            onChange={(values) => setEditingUser({ 
                              ...editingUser, 
                              teams: values,
                              adserView: [] // รีเซ็ต adser เมื่อเปลี่ยนทีม
                            })}
                            placeholder="เลือกทีม"
                          />
                        </div>
                      )}
                    </div>
                    
                    {/* เปลี่ยนรหัสผ่าน */}
                    <div className="border-t pt-2">
                      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">เปลี่ยนรหัสผ่าน (ไม่บังคับ):</label>
                      <input
                        type="password"
                        placeholder="รหัสผ่านใหม่"
                        value={editingUser.newPassword || ''}
                        onChange={e => setEditingUser({ ...editingUser, newPassword: e.target.value })}
                        className="w-full max-w-md border border-gray-300 dark:border-gray-600 px-2 py-1 rounded-md focus:ring-2 transition text-xs bg-white/80 dark:bg-slate-700/80"
                        style={{ 
                          '--tw-ring-color': colors.primary 
                        } as React.CSSProperties}
                      />
                    </div>

                    {/* เลือก Adser ที่สามารถดูได้ */}
                    {((editingUser.role === 'admin') || (editingUser.teams && editingUser.teams.length > 0)) && (
                      <div className="border-t pt-2">
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                          {editingUser.role === 'admin' 
                            ? 'Adser ที่สามารถดูได้ (ทุกทีม):' 
                            : `Adser ที่สามารถดูได้ (ทีม: ${getTeamsArray(editingUser).join(', ')}):`
                          }
                        </label>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-1 max-h-24 overflow-y-auto">
                          {(() => {
                            if (editingUser.role === 'admin') {
                              // แอดมินเห็นทุก adser
                              return adserOptions.map(adser => (
                                <label key={adser} className="flex items-center gap-1 cursor-pointer p-1 rounded hover:bg-gray-50 dark:hover:bg-slate-700 transition">
                                  <input
                                    type="checkbox"
                                    checked={(editingUser.adserView || []).includes(adser)}
                                    onChange={() => toggleAdser(adser)}
                                    className="w-3 h-3 rounded"
                                    style={{ 
                                      accentColor: colors.primary 
                                    }}
                                  />
                                  <span className="text-xs font-medium">{adser}</span>
                                </label>
                              ));
                            } else {
                              // พนักงานเห็นแค่ adser ของทีมที่เลือก
                              const availableAdsers = getTeamsArray(editingUser).reduce((acc: string[], team: string) => {
                                const teamAdsers = teamAdvertiserMapping[team] || [];
                                teamAdsers.forEach(adser => {
                                  if (!acc.includes(adser)) acc.push(adser);
                                });
                                return acc;
                              }, []);
                              
                              return availableAdsers.map((adser: string) => (
                                <label key={adser} className="flex items-center gap-1 cursor-pointer p-1 rounded hover:bg-gray-50 dark:hover:bg-slate-700 transition">
                                  <input
                                    type="checkbox"
                                    checked={(editingUser.adserView || []).includes(adser)}
                                    onChange={() => toggleAdser(adser)}
                                    className="w-3 h-3 rounded"
                                    style={{ 
                                      accentColor: colors.primary 
                                    }}
                                  />
                                  <span className="text-xs font-medium">{adser}</span>
                                </label>
                              ));
                            }
                          })()}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  // View Mode
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <UserCircle className={`w-8 h-8`} style={{ color: u.role === 'admin' ? colors.primary : '#9CA3AF' }} />
                      <div className="flex-1">
                        <div className="font-bold text-base text-gray-800 dark:text-gray-200 flex items-center gap-2">
                          {u.username}
                          {u.role === 'admin' && <ShieldCheck className="w-3 h-3" style={{ color: colors.primary }} />}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-2">
                          {u.role === 'admin' ? 'แอดมิน (ดูได้ทุกทีม)' : 'พนักงาน'}
                          {u.role === 'staff' && getTeamsArray(u).length > 0 && (
                            <>
                              <span className="text-gray-300 dark:text-gray-600">•</span>
                              <div className="flex flex-wrap gap-1">
                                {getTeamsArray(u).map((team: string) => (
                                  <span 
                                    key={team} 
                                    className="px-1 py-0.5 rounded text-xs font-medium text-white"
                                    style={{ 
                                      backgroundColor: colors.primary + '20',
                                      color: colors.primary,
                                      border: `1px solid ${colors.primary}40`
                                    }}
                                  >
                                    {team}
                                  </span>
                                ))}
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex gap-1">
                        <button 
                          onClick={() => setEditingUser({ ...u })} 
                          className="flex items-center gap-1 text-white px-2 py-1 rounded text-xs font-medium transition hover:opacity-90"
                          style={{ backgroundColor: colors.primary }}
                        >
                          <Edit2 className="w-3 h-3" />
                          แก้ไข
                        </button>
                        <button 
                          onClick={() => handleDelete(u.id)} 
                          className="flex items-center gap-1 bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded text-xs font-medium transition" 
                          disabled={loading}
                        >
                          <Trash2 className="w-3 h-3" />
                          ลบ
                        </button>
                      </div>
                    </div>

                    {/* แสดง Adser ที่สามารถดูได้ */}
                    {getAdserViewArray(u).length > 0 && (
                      <div className="border-t pt-2">
                        <div className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Adser ที่สามารถดูได้:</div>
                        <div className="flex flex-wrap gap-1">
                          {getAdserViewArray(u).map((adser: string) => (
                            <span 
                              key={adser} 
                              className="px-1 py-0.5 rounded text-xs font-medium"
                              style={{ 
                                backgroundColor: colors.primary + '20',
                                color: colors.primary,
                                border: `1px solid ${colors.primary}40`
                              }}
                            >
                              {adser}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
        
        {loading && (
          <div className="flex justify-center mt-8">
            <Loader2 className="animate-spin w-8 h-8 text-blue-600" />
          </div>
        )}
    </div>
  );
}
"use client";
/* eslint-disable */
import React, { useState, useEffect } from 'react';
import { UserCircle, ShieldCheck, Trash2, Loader2, PlusCircle, Edit2, Save, X } from 'lucide-react';

export default function UserManagement() {
  const [users, setUsers] = useState<unknown[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ username: '', password: '', role: 'staff', team: '' });
  const [editingUser, setEditingUser] = useState<any>(null);
  const [adserOptions, setAdserOptions] = useState<string[]>([]);
  const [teamOptions, setTeamOptions] = useState<string[]>([]);
  const [teamAdvertiserMapping, setTeamAdvertiserMapping] = useState<{[key: string]: string[]}>({});
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

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
      setError(err.message);
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
      const res = await fetch('/api/auth/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create user');
      setForm({ username: '', password: '', role: 'staff', team: '' });
      fetchUsers();
    } catch (err: unknown) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
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
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveEdit = async () => {
    if (!editingUser) return;
    setLoading(true);
    setError('');
    try {
      const updateData: unknown = {
        id: editingUser.id,
        adserView: editingUser.adserView,
        team: editingUser.team
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
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleAdser = (adserName: string) => {
    if (!editingUser) return;
    const adserView = editingUser.adserView || [];
    const newAdserView = adserView.includes(adserName)
      ? adserView.filter((a: string) => a !== adserName)
      : [...adserView, adserName];
    setEditingUser({ ...editingUser, adserView: newAdserView });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-blue-600 rounded-xl">
              <UserCircle className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">จัดการผู้ใช้งาน</h1>
              <p className="text-gray-600 mt-1">เพิ่ม แก้ไข และจัดการผู้ใช้ในระบบ</p>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-2">
            <X className="w-5 h-5" />
            {error}
          </div>
        )}

        {/* Create User Form */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 mb-8 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              <PlusCircle className="w-6 h-6" />
              เพิ่มผู้ใช้ใหม่
            </h2>
          </div>
          <div className="p-6">
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">ชื่อผู้ใช้</label>
                  <input 
                    placeholder="Username" 
                    value={form.username} 
                    onChange={e => setForm(f => ({ ...f, username: e.target.value }))} 
                    className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition" 
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">รหัสผ่าน</label>
                  <input 
                    placeholder="Password" 
                    type="password" 
                    value={form.password} 
                    onChange={e => setForm(f => ({ ...f, password: e.target.value }))} 
                    className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition" 
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">บทบาท</label>
                  <select 
                    value={form.role} 
                    onChange={e => setForm(f => ({ ...f, role: e.target.value }))} 
                    className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  >
                    <option value="staff">พนักงาน</option>
                    <option value="admin">ผู้ดูแลระบบ</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">ทีม</label>
                  <select 
                    value={form.team} 
                    onChange={e => setForm(f => ({ ...f, team: e.target.value }))} 
                    className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  >
                    <option value="">เลือกทีม</option>
                    {teamOptions.map(team => (
                      <option key={team} value={team}>{team}</option>
                    ))}
                  </select>
                </div>
                <div className="flex items-end">
                  <button 
                    type="submit" 
                    className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-lg font-semibold shadow-lg transition disabled:opacity-50" 
                    disabled={loading}
                  >
                    {loading ? <Loader2 className="animate-spin w-5 h-5" /> : <PlusCircle className="w-5 h-5" />}
                    {loading ? 'กำลังเพิ่ม...' : 'เพิ่มผู้ใช้'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* Users List */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <ShieldCheck className="w-7 h-7 text-blue-500" />
            รายการผู้ใช้งาน
          </h2>
          
          <div className="grid grid-cols-1 gap-6">
            {users.map(u => (
              <div key={u.id} className="bg-white rounded-xl shadow-md p-5 border border-gray-100 hover:shadow-lg transition">
                {editingUser && editingUser.id === u.id ? (
                  // Edit Mode
                  <div className="space-y-6">
                    <div className="flex items-center gap-4">
                      <UserCircle className={`w-12 h-12 ${u.role === 'admin' ? 'text-blue-600' : 'text-gray-400'}`} />
                      <div className="flex-1">
                        <div className="font-bold text-lg text-gray-800 flex items-center gap-2">
                          {u.username}
                          {u.role === 'admin' && <ShieldCheck className="w-4 h-4 text-blue-500" />}
                        </div>
                        <div className="text-sm text-gray-500">{u.role === 'admin' ? 'แอดมิน' : 'พนักงาน'}</div>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={handleSaveEdit} className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg shadow flex items-center gap-2 transition">
                          <Save className="w-4 h-4" /> บันทึก
                        </button>
                        <button onClick={() => setEditingUser(null)} className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg shadow flex items-center gap-2 transition">
                          <X className="w-4 h-4" /> ยกเลิก
                        </button>
                      </div>
                    </div>
                    
                    {/* เลือกทีม */}
                    <div className="border-t pt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">เลือกทีม:</label>
                      <select 
                        value={editingUser.team || ''} 
                        onChange={e => {
                          const newTeam = e.target.value;
                          setEditingUser({ 
                            ...editingUser, 
                            team: newTeam,
                            adserView: [] // รีเซ็ต adser เมื่อเปลี่ยนทีม
                          });
                        }}
                        className="w-full max-w-md border border-gray-300 px-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-300 transition"
                      >
                        <option value="">เลือกทีม</option>
                        {teamOptions.map(team => (
                          <option key={team} value={team}>{team}</option>
                        ))}
                      </select>
                    </div>
                    
                    {/* เปลี่ยนรหัสผ่าน */}
                    <div className="border-t pt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">เปลี่ยนรหัสผ่าน (ไม่บังคับ):</label>
                      <input
                        type="password"
                        placeholder="รหัสผ่านใหม่"
                        value={editingUser.newPassword || ''}
                        onChange={e => setEditingUser({ ...editingUser, newPassword: e.target.value })}
                        className="w-full max-w-md border border-gray-300 px-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-300 transition"
                      />
                    </div>

                    {/* เลือก Adser ที่สามารถดูได้ */}
                    {editingUser.team && (
                      <div className="border-t pt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                          Adser ที่สามารถดูได้ (ทีม {editingUser.team}):
                        </label>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                          {(teamAdvertiserMapping[editingUser.team] || []).map(adser => (
                            <label key={adser} className="flex items-center gap-2 cursor-pointer p-2 rounded-lg hover:bg-gray-50 transition">
                              <input
                                type="checkbox"
                                checked={(editingUser.adserView || []).includes(adser)}
                                onChange={() => toggleAdser(adser)}
                                className="w-4 h-4 text-blue-600 focus:ring-blue-500 rounded"
                              />
                              <span className="text-sm font-medium">{adser}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  // View Mode
                  <div className="space-y-3">
                    <div className="flex items-center gap-4">
                      <UserCircle className={`w-12 h-12 ${u.role === 'admin' ? 'text-blue-600' : 'text-gray-400'}`} />
                      <div className="flex-1">
                        <div className="font-bold text-lg text-gray-800 flex items-center gap-2">
                          {u.username}
                          {u.role === 'admin' && <ShieldCheck className="w-4 h-4 text-blue-500" />}
                        </div>
                        <div className="text-sm text-gray-500 flex items-center gap-2">
                          {u.role === 'admin' ? 'แอดมิน' : 'พนักงาน'}
                          {u.team && (
                            <>
                              <span className="text-gray-300">•</span>
                              <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-md text-xs font-medium">
                                ทีม: {u.team}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                      
                      <div className="text-xs text-gray-500">
                        สร้างเมื่อ: {new Date(u.createdAt).toLocaleDateString('th-TH')}
                      </div>
                      
                      <div className="flex gap-2">
                        <button onClick={() => {
                          setEditingUser(u);
                        }} className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg shadow flex items-center gap-1 transition">
                          <Edit2 className="w-4 h-4" /> แก้ไข
                        </button>
                        <button onClick={() => handleDelete(u.id)} className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg shadow flex items-center gap-1 transition">
                          <Trash2 className="w-4 h-4" /> ลบ
                        </button>
                      </div>
                    </div>

                    {/* แสดง Adser ที่สามารถดูได้ */}
                    {u.adserView && u.adserView.length > 0 && (
                      <div className="border-t pt-3">
                        <div className="text-sm font-medium text-gray-700 mb-2">Adser ที่สามารถดูได้:</div>
                        <div className="flex flex-wrap gap-2">
                          {u.adserView.map((adser: string) => (
                            <span key={adser} className="bg-green-100 text-green-800 px-2 py-1 rounded-md text-xs font-medium">
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
    </div>
  );
}
import React, { useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { userService } from '../services/api';
import { useToast } from '../context/ToastContext';
import Modal from '../components/Modal';

const MembersList: React.FC = () => {
    const [members, setMembers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentMember, setCurrentMember] = useState<Partial<User>>({});
    const { showToast } = useToast();

    useEffect(() => {
        loadMembers();
    }, []);

    const loadMembers = async () => {
        try {
            const data = await userService.getAll();
            setMembers(data);
        } catch (e) {
            showToast('Failed to load members', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (currentMember.id) {
                await userService.update(currentMember as User);
                showToast('Member updated successfully', 'success');
            } else {
                await userService.add({ ...currentMember, role: currentMember.role || UserRole.USER } as User);
                showToast('Member created successfully', 'success');
            }
            setIsModalOpen(false);
            loadMembers();
        } catch (e) {
            showToast('Operation failed', 'error');
        }
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Delete this member?')) {
            try {
                await userService.delete(id);
                showToast('Member deleted', 'success');
                loadMembers();
            } catch (e) {
                showToast('Failed to delete', 'error');
            }
        }
    };

    const openModal = (member?: User) => {
        setCurrentMember(member || { name: '', email: '', role: UserRole.USER, phone: '' });
        setIsModalOpen(true);
    };

    if (loading) return <div className="p-12 text-center text-gray-400 font-medium animate-pulse">Loading members...</div>;

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center bg-white p-8 rounded-[32px] shadow-sm border border-gray-100">
                <div>
                     <h1 className="text-3xl font-display font-bold text-gray-900 mb-2">Members</h1>
                     <p className="text-gray-500">Manage library users and staff.</p>
                </div>
                <button 
                    onClick={() => openModal()}
                    className="brand-gradient text-white px-6 py-3 rounded-2xl font-bold shadow-lg hover:shadow-xl hover:opacity-90 transition-all flex items-center gap-2"
                >
                    <span>+ Add Member</span>
                </button>
            </div>

            <div className="bg-white shadow-lg border border-gray-100 rounded-[32px] overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="px-8 py-5 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">User</th>
                                <th className="px-8 py-5 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Role</th>
                                <th className="px-8 py-5 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Contact</th>
                                <th className="px-8 py-5 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Joined</th>
                                <th className="px-8 py-5 text-right text-xs font-bold text-gray-400 uppercase tracking-widest">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {members.map((member) => (
                                <tr key={member.id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-4">
                                            <img src={member.avatarUrl} alt="" className="w-10 h-10 rounded-xl bg-gray-200 object-cover" />
                                            <div>
                                                <p className="font-bold text-gray-900">{member.name}</p>
                                                <p className="text-xs text-gray-500">{member.id}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                                            member.role === UserRole.ADMIN ? 'bg-purple-100 text-purple-700' :
                                            member.role === UserRole.LIBRARIAN ? 'bg-blue-100 text-blue-700' :
                                            'bg-green-100 text-green-700'
                                        }`}>
                                            {member.role}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6">
                                        <p className="text-sm text-gray-700">{member.email}</p>
                                        {member.phone && <p className="text-xs text-gray-400">{member.phone}</p>}
                                    </td>
                                    <td className="px-8 py-6 text-sm text-gray-500">
                                        {member.joinedDate ? new Date(member.joinedDate).toLocaleDateString() : 'N/A'}
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button onClick={() => openModal(member)} className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
                                                Edit
                                            </button>
                                            <button onClick={() => handleDelete(member.id)} className="p-2 text-gray-400 hover:text-red-600 transition-colors">
                                                Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={currentMember.id ? 'Edit Member' : 'Add New Member'}>
                <form onSubmit={handleSave} className="space-y-6">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Full Name</label>
                        <input 
                            type="text" 
                            required 
                            className="w-full bg-gray-50 border-none rounded-xl p-4 focus:ring-2 focus:ring-[#FF3A2F]"
                            value={currentMember.name || ''}
                            onChange={e => setCurrentMember({...currentMember, name: e.target.value})}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Email Address</label>
                        <input 
                            type="email" 
                            required 
                            className="w-full bg-gray-50 border-none rounded-xl p-4 focus:ring-2 focus:ring-[#FF3A2F]"
                            value={currentMember.email || ''}
                            onChange={e => setCurrentMember({...currentMember, email: e.target.value})}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Phone</label>
                        <input 
                            type="tel" 
                            className="w-full bg-gray-50 border-none rounded-xl p-4 focus:ring-2 focus:ring-[#FF3A2F]"
                            value={currentMember.phone || ''}
                            onChange={e => setCurrentMember({...currentMember, phone: e.target.value})}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Role</label>
                        <select 
                            className="w-full bg-gray-50 border-none rounded-xl p-4 focus:ring-2 focus:ring-[#FF3A2F]"
                            value={currentMember.role || UserRole.USER}
                            onChange={e => setCurrentMember({...currentMember, role: e.target.value as UserRole})}
                        >
                            <option value={UserRole.USER}>User</option>
                            <option value={UserRole.LIBRARIAN}>Librarian</option>
                            <option value={UserRole.ADMIN}>Admin</option>
                        </select>
                    </div>
                    <div className="pt-4">
                        <button type="submit" className="w-full brand-gradient text-white font-bold py-4 rounded-xl shadow-lg hover:opacity-90 transition-all">
                            Save Member
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default MembersList;
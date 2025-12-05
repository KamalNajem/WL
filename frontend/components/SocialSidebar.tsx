'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
    StickyNote, 
    MessageCircle, 
    Send, 
    Clock, 
    Reply, 
    Trash2,
    Edit3,
    MoreHorizontal,
    User
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

interface Note {
    id: number;
    content: string;
    timestamp_in_video: number | null;
    created_at: string;
}

interface Comment {
    id: number;
    user_name: string;
    text: string;
    parent: number | null;
    replies: Comment[];
    created_at: string;
}

interface SocialSidebarProps {
    contentId: number;
    currentTimestamp?: number;
    onSeekToTime?: (timestamp: number) => void;
}

export default function SocialSidebar({
    contentId,
    currentTimestamp = 0,
    onSeekToTime,
}: SocialSidebarProps) {
    const [notes, setNotes] = useState<Note[]>([]);
    const [comments, setComments] = useState<Comment[]>([]);
    const [newNote, setNewNote] = useState('');
    const [newComment, setNewComment] = useState('');
    const [replyTo, setReplyTo] = useState<number | null>(null);
    const [replyText, setReplyText] = useState('');
    const [isLoadingNotes, setIsLoadingNotes] = useState(true);
    const [isLoadingComments, setIsLoadingComments] = useState(true);
    const [editingNote, setEditingNote] = useState<number | null>(null);
    const [editNoteContent, setEditNoteContent] = useState('');

    // Fetch notes
    useEffect(() => {
        const fetchNotes = async () => {
            try {
                const response = await api.get(`courses/notes/?content_id=${contentId}`);
                setNotes(response.data);
            } catch (error) {
                console.error('Error fetching notes:', error);
            } finally {
                setIsLoadingNotes(false);
            }
        };
        
        fetchNotes();
    }, [contentId]);

    // Fetch comments
    useEffect(() => {
        const fetchComments = async () => {
            try {
                const response = await api.get(`courses/comments/?content_id=${contentId}`);
                setComments(response.data);
            } catch (error) {
                console.error('Error fetching comments:', error);
            } finally {
                setIsLoadingComments(false);
            }
        };
        
        fetchComments();
    }, [contentId]);

    // Format timestamp for display
    const formatTimestamp = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    // Add new note
    const handleAddNote = async () => {
        if (!newNote.trim()) return;
        
        try {
            const response = await api.post('courses/notes/', {
                content: contentId,
                content_text: newNote,
                timestamp_in_video: Math.floor(currentTimestamp),
            });
            
            setNotes([response.data, ...notes]);
            setNewNote('');
        } catch (error) {
            console.error('Error adding note:', error);
        }
    };

    // Update note
    const handleUpdateNote = async (noteId: number) => {
        if (!editNoteContent.trim()) return;
        
        try {
            const response = await api.patch(`courses/notes/${noteId}/`, {
                content_text: editNoteContent,
            });
            
            setNotes(notes.map(n => n.id === noteId ? response.data : n));
            setEditingNote(null);
            setEditNoteContent('');
        } catch (error) {
            console.error('Error updating note:', error);
        }
    };

    // Delete note
    const handleDeleteNote = async (noteId: number) => {
        try {
            await api.delete(`courses/notes/${noteId}/`);
            setNotes(notes.filter(n => n.id !== noteId));
        } catch (error) {
            console.error('Error deleting note:', error);
        }
    };

    // Add new comment
    const handleAddComment = async () => {
        if (!newComment.trim()) return;
        
        try {
            const response = await api.post('courses/comments/', {
                content: contentId,
                text: newComment,
            });
            
            setComments([response.data, ...comments]);
            setNewComment('');
        } catch (error) {
            console.error('Error adding comment:', error);
        }
    };

    // Add reply
    const handleAddReply = async (parentId: number) => {
        if (!replyText.trim()) return;
        
        try {
            const response = await api.post('courses/comments/', {
                content: contentId,
                text: replyText,
                parent: parentId,
            });
            
            // Update the comments to include the new reply
            setComments(comments.map(c => {
                if (c.id === parentId) {
                    return { ...c, replies: [...c.replies, response.data] };
                }
                return c;
            }));
            
            setReplyTo(null);
            setReplyText('');
        } catch (error) {
            console.error('Error adding reply:', error);
        }
    };

    return (
        <Card className="h-full flex flex-col">
            <Tabs defaultValue="notes" className="flex flex-col h-full">
                <CardHeader className="pb-2">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="notes" className="flex items-center gap-2">
                            <StickyNote className="w-4 h-4" />
                            Notes
                        </TabsTrigger>
                        <TabsTrigger value="comments" className="flex items-center gap-2">
                            <MessageCircle className="w-4 h-4" />
                            Comments
                        </TabsTrigger>
                    </TabsList>
                </CardHeader>

                <CardContent className="flex-1 overflow-hidden flex flex-col">
                    {/* Notes Tab */}
                    <TabsContent value="notes" className="flex-1 flex flex-col mt-0 h-full">
                        {/* Add Note */}
                        <div className="mb-4 space-y-2">
                            <textarea
                                placeholder="Take a note at this timestamp..."
                                value={newNote}
                                onChange={(e) => setNewNote(e.target.value)}
                                className="w-full min-h-[80px] p-3 text-sm border border-border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                            />
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {formatTimestamp(currentTimestamp)}
                                </span>
                                <Button size="sm" onClick={handleAddNote} disabled={!newNote.trim()}>
                                    <Send className="w-4 h-4 mr-1" />
                                    Save Note
                                </Button>
                            </div>
                        </div>

                        {/* Notes List */}
                        <div className="flex-1 overflow-y-auto space-y-3">
                            {isLoadingNotes ? (
                                <div className="text-center text-muted-foreground py-4">
                                    Loading notes...
                                </div>
                            ) : notes.length === 0 ? (
                                <div className="text-center text-muted-foreground py-4">
                                    No notes yet. Start taking notes!
                                </div>
                            ) : (
                                notes.map((note) => (
                                    <div 
                                        key={note.id} 
                                        className="p-3 bg-muted/50 rounded-lg border border-border group"
                                    >
                                        {editingNote === note.id ? (
                                            <div className="space-y-2">
                                                <textarea
                                                    value={editNoteContent}
                                                    onChange={(e) => setEditNoteContent(e.target.value)}
                                                    className="w-full min-h-[60px] p-2 text-sm border border-border rounded resize-none focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                                                />
                                                <div className="flex gap-2">
                                                    <Button size="sm" onClick={() => handleUpdateNote(note.id)}>
                                                        Save
                                                    </Button>
                                                    <Button 
                                                        size="sm" 
                                                        variant="outline"
                                                        onClick={() => {
                                                            setEditingNote(null);
                                                            setEditNoteContent('');
                                                        }}
                                                    >
                                                        Cancel
                                                    </Button>
                                                </div>
                                            </div>
                                        ) : (
                                            <>
                                                <div className="flex items-start justify-between">
                                                    {note.timestamp_in_video !== null && (
                                                        <button
                                                            onClick={() => onSeekToTime?.(note.timestamp_in_video!)}
                                                            className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full hover:bg-primary/20 transition-colors"
                                                        >
                                                            {formatTimestamp(note.timestamp_in_video)}
                                                        </button>
                                                    )}
                                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-6 w-6"
                                                            onClick={() => {
                                                                setEditingNote(note.id);
                                                                setEditNoteContent(note.content);
                                                            }}
                                                        >
                                                            <Edit3 className="w-3 h-3" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-6 w-6 text-destructive"
                                                            onClick={() => handleDeleteNote(note.id)}
                                                        >
                                                            <Trash2 className="w-3 h-3" />
                                                        </Button>
                                                    </div>
                                                </div>
                                                <p className="text-sm mt-2">{note.content}</p>
                                                <p className="text-xs text-muted-foreground mt-2">
                                                    {formatDistanceToNow(new Date(note.created_at), { addSuffix: true })}
                                                </p>
                                            </>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </TabsContent>

                    {/* Comments Tab */}
                    <TabsContent value="comments" className="flex-1 flex flex-col mt-0 h-full">
                        {/* Add Comment */}
                        <div className="mb-4 flex gap-2">
                            <Input
                                placeholder="Add a comment..."
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
                            />
                            <Button size="icon" onClick={handleAddComment} disabled={!newComment.trim()}>
                                <Send className="w-4 h-4" />
                            </Button>
                        </div>

                        {/* Comments List */}
                        <div className="flex-1 overflow-y-auto space-y-4">
                            {isLoadingComments ? (
                                <div className="text-center text-muted-foreground py-4">
                                    Loading comments...
                                </div>
                            ) : comments.length === 0 ? (
                                <div className="text-center text-muted-foreground py-4">
                                    No comments yet. Start the discussion!
                                </div>
                            ) : (
                                comments.map((comment) => (
                                    <div key={comment.id} className="space-y-2">
                                        {/* Main Comment */}
                                        <div className="p-3 bg-muted/30 rounded-lg">
                                            <div className="flex items-center gap-2 mb-2">
                                                <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                                                    <User className="w-3 h-3 text-primary" />
                                                </div>
                                                <span className="text-sm font-medium">{comment.user_name}</span>
                                                <span className="text-xs text-muted-foreground">
                                                    {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                                                </span>
                                            </div>
                                            <p className="text-sm">{comment.text}</p>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="mt-2 h-6 text-xs"
                                                onClick={() => setReplyTo(replyTo === comment.id ? null : comment.id)}
                                            >
                                                <Reply className="w-3 h-3 mr-1" />
                                                Reply
                                            </Button>

                                            {/* Reply Input */}
                                            {replyTo === comment.id && (
                                                <div className="mt-2 flex gap-2">
                                                    <Input
                                                        placeholder="Write a reply..."
                                                        value={replyText}
                                                        onChange={(e) => setReplyText(e.target.value)}
                                                        onKeyDown={(e) => e.key === 'Enter' && handleAddReply(comment.id)}
                                                        className="h-8 text-sm"
                                                    />
                                                    <Button 
                                                        size="sm" 
                                                        className="h-8"
                                                        onClick={() => handleAddReply(comment.id)}
                                                        disabled={!replyText.trim()}
                                                    >
                                                        <Send className="w-3 h-3" />
                                                    </Button>
                                                </div>
                                            )}
                                        </div>

                                        {/* Replies */}
                                        {comment.replies && comment.replies.length > 0 && (
                                            <div className="ml-6 space-y-2">
                                                {comment.replies.map((reply) => (
                                                    <div key={reply.id} className="p-3 bg-muted/20 rounded-lg border-l-2 border-primary/30">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center">
                                                                <User className="w-2.5 h-2.5 text-primary" />
                                                            </div>
                                                            <span className="text-sm font-medium">{reply.user_name}</span>
                                                            <span className="text-xs text-muted-foreground">
                                                                {formatDistanceToNow(new Date(reply.created_at), { addSuffix: true })}
                                                            </span>
                                                        </div>
                                                        <p className="text-sm">{reply.text}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </TabsContent>
                </CardContent>
            </Tabs>
        </Card>
    );
}

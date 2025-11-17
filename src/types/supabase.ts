export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      ai_messages: {
        Row: {
          content: string;
          created_at: string;
          id: string;
          role: 'user' | 'assistant';
          session_id: string;
        };
        Insert: {
          content: string;
          created_at?: string;
          id?: string;
          role: 'user' | 'assistant';
          session_id: string;
        };
        Update: {
          content?: string;
          created_at?: string;
          id?: string;
          role?: 'user' | 'assistant';
          session_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'ai_messages_session_id_fkey';
            columns: ['session_id'];
            isOneToOne: false;
            referencedRelation: 'ai_sessions';
            referencedColumns: ['id'];
          }
        ];
      };
      ai_sessions: {
        Row: {
          created_at: string;
          id: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'ai_sessions_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          }
        ];
      };
      hadith: {
        Row: {
          arabic_text: string;
          book_number: string | null;
          collection: string;
          created_at: string;
          grading: string | null;
          hadith_number: string | null;
          id: string;
          reference: string | null;
          topic_tags: string[] | null;
          english_text: string;
          updated_at: string;
        };
        Insert: {
          arabic_text: string;
          book_number?: string | null;
          collection: string;
          created_at?: string;
          grading?: string | null;
          hadith_number?: string | null;
          id?: string;
          reference?: string | null;
          topic_tags?: string[] | null;
          english_text: string;
          updated_at?: string;
        };
        Update: {
          arabic_text?: string;
          book_number?: string | null;
          collection?: string;
          created_at?: string;
          grading?: string | null;
          hadith_number?: string | null;
          id?: string;
          reference?: string | null;
          topic_tags?: string[] | null;
          english_text?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      notes: {
        Row: {
          content: string;
          created_at: string;
          hadith_id: string;
          id: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          content: string;
          created_at?: string;
          hadith_id: string;
          id?: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          content?: string;
          created_at?: string;
          hadith_id?: string;
          id?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'notes_hadith_id_fkey';
            columns: ['hadith_id'];
            isOneToOne: false;
            referencedRelation: 'hadith';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'notes_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          }
        ];
      };
      profiles: {
        Row: {
          created_at: string;
          id: string;
          language_preference: string;
          name: string | null;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          id: string;
          language_preference?: string;
          name?: string | null;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          language_preference?: string;
          name?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      reports: {
        Row: {
          ai_message_id: string | null;
          created_at: string;
          description: string;
          hadith_id: string | null;
          id: string;
          type: string;
          user_id: string | null;
        };
        Insert: {
          ai_message_id?: string | null;
          created_at?: string;
          description: string;
          hadith_id?: string | null;
          id?: string;
          type: string;
          user_id?: string | null;
        };
        Update: {
          ai_message_id?: string | null;
          created_at?: string;
          description?: string;
          hadith_id?: string | null;
          id?: string;
          type?: string;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'reports_ai_message_id_fkey';
            columns: ['ai_message_id'];
            isOneToOne: false;
            referencedRelation: 'ai_messages';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'reports_hadith_id_fkey';
            columns: ['hadith_id'];
            isOneToOne: false;
            referencedRelation: 'hadith';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'reports_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          }
        ];
      };
      saved_hadith: {
        Row: {
          created_at: string;
          hadith_id: string;
          id: string;
          is_favorite: boolean;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          hadith_id: string;
          id?: string;
          is_favorite?: boolean;
          user_id: string;
        };
        Update: {
          created_at?: string;
          hadith_id?: string;
          id?: string;
          is_favorite?: boolean;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'saved_hadith_hadith_id_fkey';
            columns: ['hadith_id'];
            isOneToOne: false;
            referencedRelation: 'hadith';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'saved_hadith_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          }
        ];
      };
    };
    Views: {};
    Functions: {};
    Enums: {
      ai_role: 'user' | 'assistant';
    };
    CompositeTypes: {};
  };
}

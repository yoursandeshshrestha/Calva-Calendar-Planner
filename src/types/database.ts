export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      connected_google_accounts: {
        Row: {
          id: string
          user_id: string
          google_email: string
          google_name: string | null
          google_picture: string | null
          color: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          google_email: string
          google_name?: string | null
          google_picture?: string | null
          color?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          google_email?: string
          google_name?: string | null
          google_picture?: string | null
          color?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: Record<string, never>
    Functions: {
      get_connected_accounts: {
        Args: Record<string, never>
        Returns: Array<{
          id: string
          user_id: string
          google_email: string
          google_name: string | null
          google_picture: string | null
          color: string
          created_at: string
        }>
      }
    }
    Enums: Record<string, never>
  }
}

export type ConnectedAccount = Database['public']['Functions']['get_connected_accounts']['Returns'][number]

/**
 * Berkas ini ditulis manual dari database/schema.sql dan database/functions.sql.
 * Setelah Supabase CLI tersedia, ganti dengan hasil:
 * npx supabase gen types typescript --project-id <id>
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          name: string;
          email: string | null;
          role: string;
          phone: string | null;
          headline: string | null;
          avatar_url: string | null;
          province_id: number | null;
          city_id: number | null;
          birth_date: string | null;
          education_level: string | null;
          education_institution: string | null;
          bio: string | null;
          linkedin_url: string | null;
          portfolio_url: string | null;
          portfolios: {
            id: string;
            title: string;
            description: string;
            url?: string | null;
            skills?: string[] | null;
            year?: string | null;
          }[] | null;
          email_notifications: boolean;
          created_at: string;
        };
        Insert: {
          id: string;
          name?: string;
          email?: string | null;
          role?: string;
          phone?: string | null;
          headline?: string | null;
          avatar_url?: string | null;
          province_id?: number | null;
          city_id?: number | null;
          birth_date?: string | null;
          education_level?: string | null;
          education_institution?: string | null;
          bio?: string | null;
          linkedin_url?: string | null;
          portfolio_url?: string | null;
          portfolios?: {
            id: string;
            title: string;
            description: string;
            url?: string | null;
            skills?: string[] | null;
            year?: string | null;
          }[] | null;
          email_notifications?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string | null;
          role?: string;
          phone?: string | null;
          headline?: string | null;
          avatar_url?: string | null;
          province_id?: number | null;
          city_id?: number | null;
          birth_date?: string | null;
          education_level?: string | null;
          education_institution?: string | null;
          bio?: string | null;
          linkedin_url?: string | null;
          portfolio_url?: string | null;
          portfolios?: {
            id: string;
            title: string;
            description: string;
            url?: string | null;
            skills?: string[] | null;
            year?: string | null;
          }[] | null;
          email_notifications?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
      categories: {
        Row: {
          id: number;
          name: string;
          slug: string;
        };
        Insert: {
          id?: never;
          name: string;
          slug: string;
        };
        Update: {
          id?: never;
          name?: string;
          slug?: string;
        };
        Relationships: [];
      };
      provinces: {
        Row: {
          id: number;
          name: string;
          slug: string;
        };
        Insert: {
          id: number;
          name: string;
          slug: string;
        };
        Update: {
          id?: number;
          name?: string;
          slug?: string;
        };
        Relationships: [];
      };
      cities: {
        Row: {
          id: number;
          province_id: number;
          name: string;
          slug: string;
          type: string;
        };
        Insert: {
          id: number;
          province_id: number;
          name: string;
          slug: string;
          type: string;
        };
        Update: {
          id?: number;
          province_id?: number;
          name?: string;
          slug?: string;
          type?: string;
        };
        Relationships: [
          {
            foreignKeyName: "cities_province_id_fkey";
            columns: ["province_id"];
            isOneToOne: false;
            referencedRelation: "provinces";
            referencedColumns: ["id"];
          },
        ];
      };
      companies: {
        Row: {
          id: number;
          owner_id: string;
          name: string;
          slug: string;
          logo_path: string | null;
          website: string | null;
          industry: string | null;
          size: string | null;
          city_id: number | null;
          address_note: string | null;
          description: string | null;
          created_at: string;
        };
        Insert: {
          id?: never;
          owner_id: string;
          name: string;
          slug: string;
          logo_path?: string | null;
          website?: string | null;
          industry?: string | null;
          size?: string | null;
          city_id?: number | null;
          address_note?: string | null;
          description?: string | null;
          created_at?: string;
        };
        Update: {
          id?: never;
          owner_id?: string;
          name?: string;
          slug?: string;
          logo_path?: string | null;
          website?: string | null;
          industry?: string | null;
          size?: string | null;
          city_id?: number | null;
          address_note?: string | null;
          description?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "companies_owner_id_fkey";
            columns: ["owner_id"];
            isOneToOne: true;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "companies_city_id_fkey";
            columns: ["city_id"];
            isOneToOne: false;
            referencedRelation: "cities";
            referencedColumns: ["id"];
          },
        ];
      };
      jobs: {
        Row: {
          id: number;
          company_id: number;
          category_id: number | null;
          city_id: number | null;
          location_detail: string | null;
          title: string;
          slug: string;
          work_mode: string;
          job_type: string;
          education_min: string;
          experience_min_years: number;
          skills: string[];
          summary: string | null;
          responsibilities: string[];
          nice_to_have: string[];
          benefits: string[];
          salary_min: number | null;
          salary_max: number | null;
          deadline: string | null;
          status: string;
          review_note: string | null;
          reviewed_by: string | null;
          reviewed_at: string | null;
          ai_screening: boolean;
          is_demo: boolean;
          views: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: never;
          company_id: number;
          category_id?: number | null;
          city_id?: number | null;
          location_detail?: string | null;
          title: string;
          slug: string;
          work_mode?: string;
          job_type?: string;
          education_min?: string;
          experience_min_years?: number;
          skills?: string[];
          summary?: string | null;
          responsibilities?: string[];
          nice_to_have?: string[];
          benefits?: string[];
          salary_min?: number | null;
          salary_max?: number | null;
          deadline?: string | null;
          status?: string;
          review_note?: string | null;
          reviewed_by?: string | null;
          reviewed_at?: string | null;
          ai_screening?: boolean;
          is_demo?: boolean;
          views?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: never;
          company_id?: number;
          category_id?: number | null;
          city_id?: number | null;
          location_detail?: string | null;
          title?: string;
          slug?: string;
          work_mode?: string;
          job_type?: string;
          education_min?: string;
          experience_min_years?: number;
          skills?: string[];
          summary?: string | null;
          responsibilities?: string[];
          nice_to_have?: string[];
          benefits?: string[];
          salary_min?: number | null;
          salary_max?: number | null;
          deadline?: string | null;
          status?: string;
          review_note?: string | null;
          reviewed_by?: string | null;
          reviewed_at?: string | null;
          ai_screening?: boolean;
          is_demo?: boolean;
          views?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "jobs_company_id_fkey";
            columns: ["company_id"];
            isOneToOne: false;
            referencedRelation: "companies";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "jobs_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "categories";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "jobs_city_id_fkey";
            columns: ["city_id"];
            isOneToOne: false;
            referencedRelation: "cities";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "jobs_reviewed_by_fkey";
            columns: ["reviewed_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      applications: {
        Row: {
          id: number;
          job_id: number;
          user_id: string;
          cv_path: string;
          cover_letter: string | null;
          ai_consent: boolean;
          status: string;
          message_to_applicant: string | null;
          interview_at: string | null;
          interview_place: string | null;
          decided_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: never;
          job_id: number;
          user_id: string;
          cv_path: string;
          cover_letter?: string | null;
          ai_consent: boolean;
          status?: string;
          message_to_applicant?: string | null;
          interview_at?: string | null;
          interview_place?: string | null;
          decided_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: never;
          job_id?: number;
          user_id?: string;
          cv_path?: string;
          cover_letter?: string | null;
          ai_consent?: boolean;
          status?: string;
          message_to_applicant?: string | null;
          interview_at?: string | null;
          interview_place?: string | null;
          decided_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "applications_job_id_fkey";
            columns: ["job_id"];
            isOneToOne: false;
            referencedRelation: "jobs";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "applications_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      application_status_history: {
        Row: {
          id: number;
          application_id: number;
          from_status: string | null;
          to_status: string;
          changed_by: string | null;
          note: string | null;
          created_at: string;
        };
        Insert: {
          id?: never;
          application_id: number;
          from_status?: string | null;
          to_status: string;
          changed_by?: string | null;
          note?: string | null;
          created_at?: string;
        };
        Update: {
          id?: never;
          application_id?: number;
          from_status?: string | null;
          to_status?: string;
          changed_by?: string | null;
          note?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "application_status_history_application_id_fkey";
            columns: ["application_id"];
            isOneToOne: false;
            referencedRelation: "applications";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "application_status_history_changed_by_fkey";
            columns: ["changed_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      application_notes: {
        Row: {
          id: number;
          application_id: number;
          author_id: string;
          note: string;
          created_at: string;
        };
        Insert: {
          id?: never;
          application_id: number;
          author_id: string;
          note: string;
          created_at?: string;
        };
        Update: {
          id?: never;
          application_id?: number;
          author_id?: string;
          note?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "application_notes_application_id_fkey";
            columns: ["application_id"];
            isOneToOne: false;
            referencedRelation: "applications";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "application_notes_author_id_fkey";
            columns: ["author_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      application_ai_reviews: {
        Row: {
          id: number;
          application_id: number;
          status: string;
          score: number | null;
          level: string | null;
          summary: string | null;
          matched_skills: string[];
          missing_skills: string[];
          interview_questions: string[];
          suspicious: boolean;
          attempts: number;
          error_message: string | null;
          model: string | null;
          created_at: string;
          completed_at: string | null;
        };
        Insert: {
          id?: never;
          application_id: number;
          status?: string;
          score?: number | null;
          level?: string | null;
          summary?: string | null;
          matched_skills?: string[];
          missing_skills?: string[];
          interview_questions?: string[];
          suspicious?: boolean;
          attempts?: number;
          error_message?: string | null;
          model?: string | null;
          created_at?: string;
          completed_at?: string | null;
        };
        Update: {
          id?: never;
          application_id?: number;
          status?: string;
          score?: number | null;
          level?: string | null;
          summary?: string | null;
          matched_skills?: string[];
          missing_skills?: string[];
          interview_questions?: string[];
          suspicious?: boolean;
          attempts?: number;
          error_message?: string | null;
          model?: string | null;
          created_at?: string;
          completed_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "application_ai_reviews_application_id_fkey";
            columns: ["application_id"];
            isOneToOne: true;
            referencedRelation: "applications";
            referencedColumns: ["id"];
          },
        ];
      };
      notifications: {
        Row: {
          id: number;
          user_id: string;
          type: string;
          title: string;
          body: string | null;
          link: string | null;
          read_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: never;
          user_id: string;
          type: string;
          title: string;
          body?: string | null;
          link?: string | null;
          read_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: never;
          user_id?: string;
          type?: string;
          title?: string;
          body?: string | null;
          link?: string | null;
          read_at?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      saved_jobs: {
        Row: {
          user_id: string;
          job_id: number;
          created_at: string;
        };
        Insert: {
          user_id: string;
          job_id: number;
          created_at?: string;
        };
        Update: {
          user_id?: string;
          job_id?: number;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "saved_jobs_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "saved_jobs_job_id_fkey";
            columns: ["job_id"];
            isOneToOne: false;
            referencedRelation: "jobs";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      is_admin: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
      get_my_ai_review_status: {
        Args: {
          p_application_id: number;
        };
        Returns: string;
      };
      submit_job: {
        Args: {
          p_job_id: number;
        };
        Returns: undefined;
      };
      review_job: {
        Args: {
          p_job_id: number;
          p_decision: string;
          p_note?: string | null;
        };
        Returns: undefined;
      };
      change_application_status: {
        Args: {
          p_application_id: number;
          p_to_status: string;
          p_message?: string | null;
          p_interview_at?: string | null;
          p_interview_place?: string | null;
        };
        Returns: undefined;
      };
      register_as_company: {
        Args: Record<PropertyKey, never>;
        Returns: undefined;
      };
      jobs_count_by_province: {
        Args: Record<PropertyKey, never>;
        Returns: {
          province_id: number;
          name: string;
          slug: string;
          job_count: number;
        }[];
      };
      jobs_count_by_city: {
        Args: {
          p_province: string;
        };
        Returns: {
          city_id: number;
          name: string;
          slug: string;
          type: string;
          job_count: number;
        }[];
      };
      company_report: {
        Args: {
          p_from: string;
          p_to: string;
          p_category?: number | null;
        };
        Returns: {
          job_id: number;
          title: string;
          category_name: string;
          status: string;
          created_at: string;
          applicants_total: number;
          applicants_dikirim: number;
          applicants_ditinjau: number;
          applicants_shortlist: number;
          applicants_wawancara: number;
          applicants_ditawari: number;
          applicants_diterima: number;
          applicants_ditolak: number;
          applicants_ditarik: number;
        }[];
      };
      platform_report: {
        Args: {
          p_from: string;
          p_to: string;
        };
        Returns: {
          total_users: number;
          total_companies: number;
          jobs_draft: number;
          jobs_pending: number;
          jobs_open: number;
          jobs_rejected: number;
          jobs_closed: number;
          jobs_removed: number;
          jobs_total: number;
          jobs_created_in_period: number;
          applications_submitted_in_period: number;
        }[];
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type PublicSchema = Database[Extract<keyof Database, "public">];

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

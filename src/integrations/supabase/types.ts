export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      anotacoes: {
        Row: {
          conteudo: string
          cor: string
          created_at: string
          id: string
          titulo: string
          updated_at: string
        }
        Insert: {
          conteudo?: string
          cor?: string
          created_at?: string
          id?: string
          titulo?: string
          updated_at?: string
        }
        Update: {
          conteudo?: string
          cor?: string
          created_at?: string
          id?: string
          titulo?: string
          updated_at?: string
        }
        Relationships: []
      }
      automacoes: {
        Row: {
          created_at: string
          id: string
          mapping: Json
          nome: string
          tipo: string
          updated_at: string
          webhook_enabled: boolean
        }
        Insert: {
          created_at?: string
          id?: string
          mapping?: Json
          nome: string
          tipo?: string
          updated_at?: string
          webhook_enabled?: boolean
        }
        Update: {
          created_at?: string
          id?: string
          mapping?: Json
          nome?: string
          tipo?: string
          updated_at?: string
          webhook_enabled?: boolean
        }
        Relationships: []
      }
      campanhas: {
        Row: {
          cor: string
          created_at: string
          descricao: string | null
          id: string
          link: string | null
          nome: string
          plataforma: string | null
          status: string
          updated_at: string
        }
        Insert: {
          cor?: string
          created_at?: string
          descricao?: string | null
          id?: string
          link?: string | null
          nome: string
          plataforma?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          cor?: string
          created_at?: string
          descricao?: string | null
          id?: string
          link?: string | null
          nome?: string
          plataforma?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      leads: {
        Row: {
          campanha_id: string | null
          created_at: string
          data_conversao: string | null
          email: string | null
          id: string
          nome: string
          observacoes: string | null
          payload: Json
          status: string
          telefone: string | null
          updated_at: string
          valor_venda: number | null
        }
        Insert: {
          campanha_id?: string | null
          created_at?: string
          data_conversao?: string | null
          email?: string | null
          id?: string
          nome?: string
          observacoes?: string | null
          payload?: Json
          status?: string
          telefone?: string | null
          updated_at?: string
          valor_venda?: number | null
        }
        Update: {
          campanha_id?: string | null
          created_at?: string
          data_conversao?: string | null
          email?: string | null
          id?: string
          nome?: string
          observacoes?: string | null
          payload?: Json
          status?: string
          telefone?: string | null
          updated_at?: string
          valor_venda?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "leads_campanha_id_fkey"
            columns: ["campanha_id"]
            isOneToOne: false
            referencedRelation: "campanhas"
            referencedColumns: ["id"]
          },
        ]
      }
      motorista_veiculos: {
        Row: {
          ano: number
          chassi: string | null
          combustivel: string | null
          cor: string | null
          created_at: string
          crlv_url: string | null
          fotos_url: string[] | null
          id: string
          marca: string
          modelo: string
          motorista_id: string
          observacoes: string | null
          placa: string
          renavam: string | null
          seguro_url: string | null
          status: string
          updated_at: string
        }
        Insert: {
          ano: number
          chassi?: string | null
          combustivel?: string | null
          cor?: string | null
          created_at?: string
          crlv_url?: string | null
          fotos_url?: string[] | null
          id?: string
          marca: string
          modelo: string
          motorista_id: string
          observacoes?: string | null
          placa: string
          renavam?: string | null
          seguro_url?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          ano?: number
          chassi?: string | null
          combustivel?: string | null
          cor?: string | null
          created_at?: string
          crlv_url?: string | null
          fotos_url?: string[] | null
          id?: string
          marca?: string
          modelo?: string
          motorista_id?: string
          observacoes?: string | null
          placa?: string
          renavam?: string | null
          seguro_url?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "motorista_veiculos_motorista_id_fkey"
            columns: ["motorista_id"]
            isOneToOne: false
            referencedRelation: "motoristas"
            referencedColumns: ["id"]
          },
        ]
      }
      motoristas: {
        Row: {
          agencia: string | null
          banco: string | null
          cep: string | null
          chave_pix: string | null
          cidade: string | null
          cnh_categoria: string | null
          cnh_frente_url: string | null
          cnh_numero: string | null
          cnh_validade: string | null
          cnh_verso_url: string | null
          comprovante_residencia_url: string | null
          conta: string | null
          cpf: string
          created_at: string
          data_nascimento: string | null
          email: string | null
          endereco: string | null
          estado: string | null
          foto_perfil_url: string | null
          id: string
          nome_completo: string
          observacoes: string | null
          possui_veiculo: boolean
          rg: string | null
          status: string
          telefone: string
          tipo_conta: string | null
          tipo_pagamento: string | null
          updated_at: string
        }
        Insert: {
          agencia?: string | null
          banco?: string | null
          cep?: string | null
          chave_pix?: string | null
          cidade?: string | null
          cnh_categoria?: string | null
          cnh_frente_url?: string | null
          cnh_numero?: string | null
          cnh_validade?: string | null
          cnh_verso_url?: string | null
          comprovante_residencia_url?: string | null
          conta?: string | null
          cpf: string
          created_at?: string
          data_nascimento?: string | null
          email?: string | null
          endereco?: string | null
          estado?: string | null
          foto_perfil_url?: string | null
          id?: string
          nome_completo: string
          observacoes?: string | null
          possui_veiculo?: boolean
          rg?: string | null
          status?: string
          telefone: string
          tipo_conta?: string | null
          tipo_pagamento?: string | null
          updated_at?: string
        }
        Update: {
          agencia?: string | null
          banco?: string | null
          cep?: string | null
          chave_pix?: string | null
          cidade?: string | null
          cnh_categoria?: string | null
          cnh_frente_url?: string | null
          cnh_numero?: string | null
          cnh_validade?: string | null
          cnh_verso_url?: string | null
          comprovante_residencia_url?: string | null
          conta?: string | null
          cpf?: string
          created_at?: string
          data_nascimento?: string | null
          email?: string | null
          endereco?: string | null
          estado?: string | null
          foto_perfil_url?: string | null
          id?: string
          nome_completo?: string
          observacoes?: string | null
          possui_veiculo?: boolean
          rg?: string | null
          status?: string
          telefone?: string
          tipo_conta?: string | null
          tipo_pagamento?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      parceiro_veiculos: {
        Row: {
          ano: number | null
          combustivel: string | null
          cor: string | null
          created_at: string
          crlv_url: string | null
          id: string
          marca: string
          modelo: string
          parceiro_id: string
          placa: string
          renavam: string | null
          seguro_url: string | null
          status: string
          updated_at: string
        }
        Insert: {
          ano?: number | null
          combustivel?: string | null
          cor?: string | null
          created_at?: string
          crlv_url?: string | null
          id?: string
          marca: string
          modelo: string
          parceiro_id: string
          placa: string
          renavam?: string | null
          seguro_url?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          ano?: number | null
          combustivel?: string | null
          cor?: string | null
          created_at?: string
          crlv_url?: string | null
          id?: string
          marca?: string
          modelo?: string
          parceiro_id?: string
          placa?: string
          renavam?: string | null
          seguro_url?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "parceiro_veiculos_parceiro_id_fkey"
            columns: ["parceiro_id"]
            isOneToOne: false
            referencedRelation: "parceiros"
            referencedColumns: ["id"]
          },
        ]
      }
      parceiros: {
        Row: {
          cep: string | null
          cidade: string | null
          cnpj: string
          contrato_url: string | null
          created_at: string
          email: string | null
          endereco: string | null
          estado: string | null
          id: string
          inscricao_estadual: string | null
          logo_url: string | null
          nome_fantasia: string | null
          observacoes: string | null
          razao_social: string
          responsavel_email: string | null
          responsavel_nome: string | null
          responsavel_telefone: string | null
          status: string
          telefone: string | null
          updated_at: string
          whatsapp: string | null
        }
        Insert: {
          cep?: string | null
          cidade?: string | null
          cnpj: string
          contrato_url?: string | null
          created_at?: string
          email?: string | null
          endereco?: string | null
          estado?: string | null
          id?: string
          inscricao_estadual?: string | null
          logo_url?: string | null
          nome_fantasia?: string | null
          observacoes?: string | null
          razao_social: string
          responsavel_email?: string | null
          responsavel_nome?: string | null
          responsavel_telefone?: string | null
          status?: string
          telefone?: string | null
          updated_at?: string
          whatsapp?: string | null
        }
        Update: {
          cep?: string | null
          cidade?: string | null
          cnpj?: string
          contrato_url?: string | null
          created_at?: string
          email?: string | null
          endereco?: string | null
          estado?: string | null
          id?: string
          inscricao_estadual?: string | null
          logo_url?: string | null
          nome_fantasia?: string | null
          observacoes?: string | null
          razao_social?: string
          responsavel_email?: string | null
          responsavel_nome?: string | null
          responsavel_telefone?: string | null
          status?: string
          telefone?: string | null
          updated_at?: string
          whatsapp?: string | null
        }
        Relationships: []
      }
      reservas_transfer: {
        Row: {
          cliente_cpf_cnpj: string | null
          cliente_email: string | null
          cliente_nome: string | null
          cliente_origem: string | null
          cliente_telefone: string | null
          created_at: string
          desconto_percentual: number | null
          id: string
          ida_cupom: string | null
          ida_data: string | null
          ida_destino: string | null
          ida_embarque: string | null
          ida_hora: string | null
          ida_mensagem: string | null
          ida_passageiros: number | null
          metodo_pagamento: string | null
          motorista_nome: string | null
          motorista_telefone: string | null
          observacoes: string | null
          por_hora_cupom: string | null
          por_hora_data: string | null
          por_hora_endereco_inicio: string | null
          por_hora_hora: string | null
          por_hora_itinerario: string | null
          por_hora_passageiros: number | null
          por_hora_ponto_encerramento: string | null
          por_hora_qtd_horas: number | null
          solicitacao_id: string | null
          status: string
          tipo_viagem: string
          updated_at: string
          valor_base: number | null
          valor_total: number | null
          veiculo: string | null
          volta_cupom: string | null
          volta_data: string | null
          volta_destino: string | null
          volta_embarque: string | null
          volta_hora: string | null
          volta_mensagem: string | null
          volta_passageiros: number | null
        }
        Insert: {
          cliente_cpf_cnpj?: string | null
          cliente_email?: string | null
          cliente_nome?: string | null
          cliente_origem?: string | null
          cliente_telefone?: string | null
          created_at?: string
          desconto_percentual?: number | null
          id?: string
          ida_cupom?: string | null
          ida_data?: string | null
          ida_destino?: string | null
          ida_embarque?: string | null
          ida_hora?: string | null
          ida_mensagem?: string | null
          ida_passageiros?: number | null
          metodo_pagamento?: string | null
          motorista_nome?: string | null
          motorista_telefone?: string | null
          observacoes?: string | null
          por_hora_cupom?: string | null
          por_hora_data?: string | null
          por_hora_endereco_inicio?: string | null
          por_hora_hora?: string | null
          por_hora_itinerario?: string | null
          por_hora_passageiros?: number | null
          por_hora_ponto_encerramento?: string | null
          por_hora_qtd_horas?: number | null
          solicitacao_id?: string | null
          status?: string
          tipo_viagem: string
          updated_at?: string
          valor_base?: number | null
          valor_total?: number | null
          veiculo?: string | null
          volta_cupom?: string | null
          volta_data?: string | null
          volta_destino?: string | null
          volta_embarque?: string | null
          volta_hora?: string | null
          volta_mensagem?: string | null
          volta_passageiros?: number | null
        }
        Update: {
          cliente_cpf_cnpj?: string | null
          cliente_email?: string | null
          cliente_nome?: string | null
          cliente_origem?: string | null
          cliente_telefone?: string | null
          created_at?: string
          desconto_percentual?: number | null
          id?: string
          ida_cupom?: string | null
          ida_data?: string | null
          ida_destino?: string | null
          ida_embarque?: string | null
          ida_hora?: string | null
          ida_mensagem?: string | null
          ida_passageiros?: number | null
          metodo_pagamento?: string | null
          motorista_nome?: string | null
          motorista_telefone?: string | null
          observacoes?: string | null
          por_hora_cupom?: string | null
          por_hora_data?: string | null
          por_hora_endereco_inicio?: string | null
          por_hora_hora?: string | null
          por_hora_itinerario?: string | null
          por_hora_passageiros?: number | null
          por_hora_ponto_encerramento?: string | null
          por_hora_qtd_horas?: number | null
          solicitacao_id?: string | null
          status?: string
          tipo_viagem?: string
          updated_at?: string
          valor_base?: number | null
          valor_total?: number | null
          veiculo?: string | null
          volta_cupom?: string | null
          volta_data?: string | null
          volta_destino?: string | null
          volta_embarque?: string | null
          volta_hora?: string | null
          volta_mensagem?: string | null
          volta_passageiros?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "reservas_transfer_solicitacao_id_fkey"
            columns: ["solicitacao_id"]
            isOneToOne: false
            referencedRelation: "solicitacoes_transfer"
            referencedColumns: ["id"]
          },
        ]
      }
      solicitacoes_motorista: {
        Row: {
          cidade: string | null
          cnh_categoria: string | null
          cnh_numero: string | null
          cpf: string | null
          created_at: string
          email: string | null
          estado: string | null
          experiencia: string | null
          id: string
          mensagem: string | null
          nome_completo: string
          possui_veiculo: boolean | null
          status: string
          telefone: string | null
          updated_at: string
          veiculo_ano: string | null
          veiculo_marca: string | null
          veiculo_modelo: string | null
          veiculo_placa: string | null
        }
        Insert: {
          cidade?: string | null
          cnh_categoria?: string | null
          cnh_numero?: string | null
          cpf?: string | null
          created_at?: string
          email?: string | null
          estado?: string | null
          experiencia?: string | null
          id?: string
          mensagem?: string | null
          nome_completo: string
          possui_veiculo?: boolean | null
          status?: string
          telefone?: string | null
          updated_at?: string
          veiculo_ano?: string | null
          veiculo_marca?: string | null
          veiculo_modelo?: string | null
          veiculo_placa?: string | null
        }
        Update: {
          cidade?: string | null
          cnh_categoria?: string | null
          cnh_numero?: string | null
          cpf?: string | null
          created_at?: string
          email?: string | null
          estado?: string | null
          experiencia?: string | null
          id?: string
          mensagem?: string | null
          nome_completo?: string
          possui_veiculo?: boolean | null
          status?: string
          telefone?: string | null
          updated_at?: string
          veiculo_ano?: string | null
          veiculo_marca?: string | null
          veiculo_modelo?: string | null
          veiculo_placa?: string | null
        }
        Relationships: []
      }
      solicitacoes_transfer: {
        Row: {
          automacao_id: string | null
          cliente_email: string | null
          cliente_nome: string | null
          cliente_origem: string | null
          cliente_telefone: string | null
          created_at: string
          id: string
          ida_cupom: string | null
          ida_data: string | null
          ida_destino: string | null
          ida_embarque: string | null
          ida_hora: string | null
          ida_mensagem: string | null
          ida_passageiros: number | null
          por_hora_cupom: string | null
          por_hora_data: string | null
          por_hora_endereco_inicio: string | null
          por_hora_hora: string | null
          por_hora_itinerario: string | null
          por_hora_passageiros: number | null
          por_hora_ponto_encerramento: string | null
          por_hora_qtd_horas: number | null
          status: string
          tipo_viagem: string
          updated_at: string
          volta_cupom: string | null
          volta_data: string | null
          volta_destino: string | null
          volta_embarque: string | null
          volta_hora: string | null
          volta_mensagem: string | null
          volta_passageiros: number | null
        }
        Insert: {
          automacao_id?: string | null
          cliente_email?: string | null
          cliente_nome?: string | null
          cliente_origem?: string | null
          cliente_telefone?: string | null
          created_at?: string
          id?: string
          ida_cupom?: string | null
          ida_data?: string | null
          ida_destino?: string | null
          ida_embarque?: string | null
          ida_hora?: string | null
          ida_mensagem?: string | null
          ida_passageiros?: number | null
          por_hora_cupom?: string | null
          por_hora_data?: string | null
          por_hora_endereco_inicio?: string | null
          por_hora_hora?: string | null
          por_hora_itinerario?: string | null
          por_hora_passageiros?: number | null
          por_hora_ponto_encerramento?: string | null
          por_hora_qtd_horas?: number | null
          status?: string
          tipo_viagem: string
          updated_at?: string
          volta_cupom?: string | null
          volta_data?: string | null
          volta_destino?: string | null
          volta_embarque?: string | null
          volta_hora?: string | null
          volta_mensagem?: string | null
          volta_passageiros?: number | null
        }
        Update: {
          automacao_id?: string | null
          cliente_email?: string | null
          cliente_nome?: string | null
          cliente_origem?: string | null
          cliente_telefone?: string | null
          created_at?: string
          id?: string
          ida_cupom?: string | null
          ida_data?: string | null
          ida_destino?: string | null
          ida_embarque?: string | null
          ida_hora?: string | null
          ida_mensagem?: string | null
          ida_passageiros?: number | null
          por_hora_cupom?: string | null
          por_hora_data?: string | null
          por_hora_endereco_inicio?: string | null
          por_hora_hora?: string | null
          por_hora_itinerario?: string | null
          por_hora_passageiros?: number | null
          por_hora_ponto_encerramento?: string | null
          por_hora_qtd_horas?: number | null
          status?: string
          tipo_viagem?: string
          updated_at?: string
          volta_cupom?: string | null
          volta_data?: string | null
          volta_destino?: string | null
          volta_embarque?: string | null
          volta_hora?: string | null
          volta_mensagem?: string | null
          volta_passageiros?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "solicitacoes_transfer_automacao_id_fkey"
            columns: ["automacao_id"]
            isOneToOne: false
            referencedRelation: "automacoes"
            referencedColumns: ["id"]
          },
        ]
      }
      subparceiros: {
        Row: {
          cpf_cnpj: string | null
          created_at: string
          email: string | null
          funcao: string | null
          id: string
          nome: string
          observacoes: string | null
          parceiro_id: string
          telefone: string | null
          updated_at: string
        }
        Insert: {
          cpf_cnpj?: string | null
          created_at?: string
          email?: string | null
          funcao?: string | null
          id?: string
          nome: string
          observacoes?: string | null
          parceiro_id: string
          telefone?: string | null
          updated_at?: string
        }
        Update: {
          cpf_cnpj?: string | null
          created_at?: string
          email?: string | null
          funcao?: string | null
          id?: string
          nome?: string
          observacoes?: string | null
          parceiro_id?: string
          telefone?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "subparceiros_parceiro_id_fkey"
            columns: ["parceiro_id"]
            isOneToOne: false
            referencedRelation: "parceiros"
            referencedColumns: ["id"]
          },
        ]
      }
      system_settings: {
        Row: {
          created_at: string
          id: string
          key: string
          updated_at: string
          value: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          key: string
          updated_at?: string
          value?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          key?: string
          updated_at?: string
          value?: string | null
        }
        Relationships: []
      }
      tracking_links: {
        Row: {
          categoria: string
          cliente_nome: string | null
          cliente_telefone: string | null
          created_at: string
          expires_at: string | null
          id: string
          last_location_at: string | null
          latitude: number | null
          longitude: number | null
          observacoes: string | null
          reserva_id: string | null
          status: string
          token: string
          updated_at: string
        }
        Insert: {
          categoria?: string
          cliente_nome?: string | null
          cliente_telefone?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          last_location_at?: string | null
          latitude?: number | null
          longitude?: number | null
          observacoes?: string | null
          reserva_id?: string | null
          status?: string
          token?: string
          updated_at?: string
        }
        Update: {
          categoria?: string
          cliente_nome?: string | null
          cliente_telefone?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          last_location_at?: string | null
          latitude?: number | null
          longitude?: number | null
          observacoes?: string | null
          reserva_id?: string | null
          status?: string
          token?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tracking_links_reserva_id_fkey"
            columns: ["reserva_id"]
            isOneToOne: false
            referencedRelation: "reservas_transfer"
            referencedColumns: ["id"]
          },
        ]
      }
      webhook_tests: {
        Row: {
          automacao_id: string | null
          created_at: string
          id: string
          label: string
          payload: Json
        }
        Insert: {
          automacao_id?: string | null
          created_at?: string
          id?: string
          label?: string
          payload?: Json
        }
        Update: {
          automacao_id?: string | null
          created_at?: string
          id?: string
          label?: string
          payload?: Json
        }
        Relationships: [
          {
            foreignKeyName: "webhook_tests_automacao_id_fkey"
            columns: ["automacao_id"]
            isOneToOne: false
            referencedRelation: "automacoes"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const

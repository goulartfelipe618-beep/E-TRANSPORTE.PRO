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
      agendamentos_motorista: {
        Row: {
          created_at: string
          data_servico: string
          horario: string
          id: string
          local_destino: string | null
          local_origem: string | null
          motorista_email: string | null
          motorista_nome: string
          motorista_telefone: string
          observacoes: string | null
          status: string
          tenant_id: string | null
          tipo_servico: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          data_servico: string
          horario: string
          id?: string
          local_destino?: string | null
          local_origem?: string | null
          motorista_email?: string | null
          motorista_nome: string
          motorista_telefone: string
          observacoes?: string | null
          status?: string
          tenant_id?: string | null
          tipo_servico?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          data_servico?: string
          horario?: string
          id?: string
          local_destino?: string | null
          local_origem?: string | null
          motorista_email?: string | null
          motorista_nome?: string
          motorista_telefone?: string
          observacoes?: string | null
          status?: string
          tenant_id?: string | null
          tipo_servico?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "agendamentos_motorista_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      anotacoes: {
        Row: {
          conteudo: string
          cor: string
          created_at: string
          id: string
          tenant_id: string | null
          titulo: string
          updated_at: string
        }
        Insert: {
          conteudo?: string
          cor?: string
          created_at?: string
          id?: string
          tenant_id?: string | null
          titulo?: string
          updated_at?: string
        }
        Update: {
          conteudo?: string
          cor?: string
          created_at?: string
          id?: string
          tenant_id?: string | null
          titulo?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "anotacoes_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      api_configs: {
        Row: {
          ativo: boolean
          config: Json
          created_at: string
          id: string
          provider: string
          updated_at: string
        }
        Insert: {
          ativo?: boolean
          config?: Json
          created_at?: string
          id?: string
          provider: string
          updated_at?: string
        }
        Update: {
          ativo?: boolean
          config?: Json
          created_at?: string
          id?: string
          provider?: string
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
          tenant_id: string | null
          tipo: string
          updated_at: string
          webhook_enabled: boolean
        }
        Insert: {
          created_at?: string
          id?: string
          mapping?: Json
          nome: string
          tenant_id?: string | null
          tipo?: string
          updated_at?: string
          webhook_enabled?: boolean
        }
        Update: {
          created_at?: string
          id?: string
          mapping?: Json
          nome?: string
          tenant_id?: string | null
          tipo?: string
          updated_at?: string
          webhook_enabled?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "automacoes_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      automation_categories: {
        Row: {
          ativo: boolean
          campos: Json
          created_at: string
          descricao: string | null
          id: string
          nome: string
          slug: string
          updated_at: string
        }
        Insert: {
          ativo?: boolean
          campos?: Json
          created_at?: string
          descricao?: string | null
          id?: string
          nome: string
          slug: string
          updated_at?: string
        }
        Update: {
          ativo?: boolean
          campos?: Json
          created_at?: string
          descricao?: string | null
          id?: string
          nome?: string
          slug?: string
          updated_at?: string
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
          tenant_id: string | null
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
          tenant_id?: string | null
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
          tenant_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "campanhas_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      comunicadores: {
        Row: {
          ativo: boolean
          created_at: string
          descricao: string | null
          id: string
          nome: string
          tenant_id: string | null
          updated_at: string
          webhook_url: string
        }
        Insert: {
          ativo?: boolean
          created_at?: string
          descricao?: string | null
          id?: string
          nome: string
          tenant_id?: string | null
          updated_at?: string
          webhook_url: string
        }
        Update: {
          ativo?: boolean
          created_at?: string
          descricao?: string | null
          id?: string
          nome?: string
          tenant_id?: string | null
          updated_at?: string
          webhook_url?: string
        }
        Relationships: [
          {
            foreignKeyName: "comunicadores_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
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
          tenant_id: string | null
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
          tenant_id?: string | null
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
          tenant_id?: string | null
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
          {
            foreignKeyName: "leads_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
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
          tenant_id: string | null
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
          tenant_id?: string | null
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
          tenant_id?: string | null
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
          {
            foreignKeyName: "motorista_veiculos_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
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
          tenant_id: string | null
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
          tenant_id?: string | null
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
          tenant_id?: string | null
          tipo_conta?: string | null
          tipo_pagamento?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "motoristas_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      network_contacts: {
        Row: {
          categoria: string
          cidade: string | null
          cnpj: string | null
          contato_cargo: string | null
          contato_email: string | null
          contato_nome: string | null
          contato_telefone: string | null
          created_at: string
          endereco: string | null
          estado: string | null
          id: string
          nome_empresa: string
          observacoes: string | null
          potencial_negocio: string | null
          responsavel: string | null
          status_contato: string
          tenant_id: string | null
          tipo_estabelecimento: string | null
          updated_at: string
          website: string | null
        }
        Insert: {
          categoria: string
          cidade?: string | null
          cnpj?: string | null
          contato_cargo?: string | null
          contato_email?: string | null
          contato_nome?: string | null
          contato_telefone?: string | null
          created_at?: string
          endereco?: string | null
          estado?: string | null
          id?: string
          nome_empresa: string
          observacoes?: string | null
          potencial_negocio?: string | null
          responsavel?: string | null
          status_contato?: string
          tenant_id?: string | null
          tipo_estabelecimento?: string | null
          updated_at?: string
          website?: string | null
        }
        Update: {
          categoria?: string
          cidade?: string | null
          cnpj?: string | null
          contato_cargo?: string | null
          contato_email?: string | null
          contato_nome?: string | null
          contato_telefone?: string | null
          created_at?: string
          endereco?: string | null
          estado?: string | null
          id?: string
          nome_empresa?: string
          observacoes?: string | null
          potencial_negocio?: string | null
          responsavel?: string | null
          status_contato?: string
          tenant_id?: string | null
          tipo_estabelecimento?: string | null
          updated_at?: string
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "network_contacts_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          lida: boolean
          mensagem: string | null
          referencia_id: string | null
          referencia_tipo: string | null
          tenant_id: string | null
          tipo: string
          titulo: string
        }
        Insert: {
          created_at?: string
          id?: string
          lida?: boolean
          mensagem?: string | null
          referencia_id?: string | null
          referencia_tipo?: string | null
          tenant_id?: string | null
          tipo?: string
          titulo: string
        }
        Update: {
          created_at?: string
          id?: string
          lida?: boolean
          mensagem?: string | null
          referencia_id?: string | null
          referencia_tipo?: string | null
          tenant_id?: string | null
          tipo?: string
          titulo?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
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
          tenant_id: string | null
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
          tenant_id?: string | null
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
          tenant_id?: string | null
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
          {
            foreignKeyName: "parceiro_veiculos_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
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
          tenant_id: string | null
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
          tenant_id?: string | null
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
          tenant_id?: string | null
          updated_at?: string
          whatsapp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "parceiros_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      reservas_grupos: {
        Row: {
          cliente_cpf_cnpj: string | null
          cliente_email: string | null
          cliente_nome: string | null
          cliente_origem: string | null
          cliente_whatsapp: string | null
          created_at: string
          cupom: string | null
          data_ida: string | null
          data_retorno: string | null
          desconto_percentual: number | null
          destino: string | null
          embarque_lat: number | null
          embarque_lng: number | null
          endereco_embarque: string | null
          hora_ida: string | null
          hora_retorno: string | null
          id: string
          metodo_pagamento: string | null
          motorista_nome: string | null
          motorista_telefone: string | null
          numero_passageiros: number | null
          observacoes: string | null
          solicitacao_id: string | null
          status: string
          tenant_id: string | null
          tipo_veiculo: string | null
          updated_at: string
          valor_base: number | null
          valor_total: number | null
          veiculo: string | null
        }
        Insert: {
          cliente_cpf_cnpj?: string | null
          cliente_email?: string | null
          cliente_nome?: string | null
          cliente_origem?: string | null
          cliente_whatsapp?: string | null
          created_at?: string
          cupom?: string | null
          data_ida?: string | null
          data_retorno?: string | null
          desconto_percentual?: number | null
          destino?: string | null
          embarque_lat?: number | null
          embarque_lng?: number | null
          endereco_embarque?: string | null
          hora_ida?: string | null
          hora_retorno?: string | null
          id?: string
          metodo_pagamento?: string | null
          motorista_nome?: string | null
          motorista_telefone?: string | null
          numero_passageiros?: number | null
          observacoes?: string | null
          solicitacao_id?: string | null
          status?: string
          tenant_id?: string | null
          tipo_veiculo?: string | null
          updated_at?: string
          valor_base?: number | null
          valor_total?: number | null
          veiculo?: string | null
        }
        Update: {
          cliente_cpf_cnpj?: string | null
          cliente_email?: string | null
          cliente_nome?: string | null
          cliente_origem?: string | null
          cliente_whatsapp?: string | null
          created_at?: string
          cupom?: string | null
          data_ida?: string | null
          data_retorno?: string | null
          desconto_percentual?: number | null
          destino?: string | null
          embarque_lat?: number | null
          embarque_lng?: number | null
          endereco_embarque?: string | null
          hora_ida?: string | null
          hora_retorno?: string | null
          id?: string
          metodo_pagamento?: string | null
          motorista_nome?: string | null
          motorista_telefone?: string | null
          numero_passageiros?: number | null
          observacoes?: string | null
          solicitacao_id?: string | null
          status?: string
          tenant_id?: string | null
          tipo_veiculo?: string | null
          updated_at?: string
          valor_base?: number | null
          valor_total?: number | null
          veiculo?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reservas_grupos_solicitacao_id_fkey"
            columns: ["solicitacao_id"]
            isOneToOne: false
            referencedRelation: "solicitacoes_grupos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reservas_grupos_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
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
          ida_embarque_lat: number | null
          ida_embarque_lng: number | null
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
          tenant_id: string | null
          tipo_viagem: string
          updated_at: string
          valor_base: number | null
          valor_total: number | null
          veiculo: string | null
          volta_cupom: string | null
          volta_data: string | null
          volta_destino: string | null
          volta_embarque: string | null
          volta_embarque_lat: number | null
          volta_embarque_lng: number | null
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
          ida_embarque_lat?: number | null
          ida_embarque_lng?: number | null
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
          tenant_id?: string | null
          tipo_viagem: string
          updated_at?: string
          valor_base?: number | null
          valor_total?: number | null
          veiculo?: string | null
          volta_cupom?: string | null
          volta_data?: string | null
          volta_destino?: string | null
          volta_embarque?: string | null
          volta_embarque_lat?: number | null
          volta_embarque_lng?: number | null
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
          ida_embarque_lat?: number | null
          ida_embarque_lng?: number | null
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
          tenant_id?: string | null
          tipo_viagem?: string
          updated_at?: string
          valor_base?: number | null
          valor_total?: number | null
          veiculo?: string | null
          volta_cupom?: string | null
          volta_data?: string | null
          volta_destino?: string | null
          volta_embarque?: string | null
          volta_embarque_lat?: number | null
          volta_embarque_lng?: number | null
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
          {
            foreignKeyName: "reservas_transfer_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      solicitacoes_grupos: {
        Row: {
          automacao_id: string | null
          cliente_email: string | null
          cliente_nome: string | null
          cliente_origem: string | null
          cliente_whatsapp: string | null
          created_at: string
          cupom: string | null
          data_ida: string | null
          data_retorno: string | null
          destino: string | null
          endereco_embarque: string | null
          hora_ida: string | null
          hora_retorno: string | null
          id: string
          numero_passageiros: number | null
          observacoes: string | null
          status: string
          tenant_id: string | null
          tipo_veiculo: string | null
          updated_at: string
        }
        Insert: {
          automacao_id?: string | null
          cliente_email?: string | null
          cliente_nome?: string | null
          cliente_origem?: string | null
          cliente_whatsapp?: string | null
          created_at?: string
          cupom?: string | null
          data_ida?: string | null
          data_retorno?: string | null
          destino?: string | null
          endereco_embarque?: string | null
          hora_ida?: string | null
          hora_retorno?: string | null
          id?: string
          numero_passageiros?: number | null
          observacoes?: string | null
          status?: string
          tenant_id?: string | null
          tipo_veiculo?: string | null
          updated_at?: string
        }
        Update: {
          automacao_id?: string | null
          cliente_email?: string | null
          cliente_nome?: string | null
          cliente_origem?: string | null
          cliente_whatsapp?: string | null
          created_at?: string
          cupom?: string | null
          data_ida?: string | null
          data_retorno?: string | null
          destino?: string | null
          endereco_embarque?: string | null
          hora_ida?: string | null
          hora_retorno?: string | null
          id?: string
          numero_passageiros?: number | null
          observacoes?: string | null
          status?: string
          tenant_id?: string | null
          tipo_veiculo?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "solicitacoes_grupos_automacao_id_fkey"
            columns: ["automacao_id"]
            isOneToOne: false
            referencedRelation: "automacoes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "solicitacoes_grupos_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
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
          tenant_id: string | null
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
          tenant_id?: string | null
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
          tenant_id?: string | null
          updated_at?: string
          veiculo_ano?: string | null
          veiculo_marca?: string | null
          veiculo_modelo?: string | null
          veiculo_placa?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "solicitacoes_motorista_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
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
          tenant_id: string | null
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
          tenant_id?: string | null
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
          tenant_id?: string | null
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
          {
            foreignKeyName: "solicitacoes_transfer_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
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
          tenant_id: string | null
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
          tenant_id?: string | null
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
          tenant_id?: string | null
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
          {
            foreignKeyName: "subparceiros_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      system_logs: {
        Row: {
          action: string
          created_at: string
          details: Json | null
          id: string
          tenant_id: string | null
          user_email: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          details?: Json | null
          id?: string
          tenant_id?: string | null
          user_email?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          details?: Json | null
          id?: string
          tenant_id?: string | null
          user_email?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "system_logs_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
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
      tenant_menu_config: {
        Row: {
          enabled: boolean
          id: string
          menu_key: string
          tenant_id: string
        }
        Insert: {
          enabled?: boolean
          id?: string
          menu_key: string
          tenant_id: string
        }
        Update: {
          enabled?: boolean
          id?: string
          menu_key?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tenant_menu_config_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      tenants: {
        Row: {
          ativo: boolean
          created_at: string
          id: string
          logo_url: string | null
          nome: string
          slug: string
          updated_at: string
        }
        Insert: {
          ativo?: boolean
          created_at?: string
          id?: string
          logo_url?: string | null
          nome: string
          slug: string
          updated_at?: string
        }
        Update: {
          ativo?: boolean
          created_at?: string
          id?: string
          logo_url?: string | null
          nome?: string
          slug?: string
          updated_at?: string
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
          tenant_id: string | null
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
          tenant_id?: string | null
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
          tenant_id?: string | null
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
          {
            foreignKeyName: "tracking_links_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          tenant_id: string | null
          user_id: string
        }
        Insert: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          tenant_id?: string | null
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          tenant_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
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
          tenant_id: string | null
        }
        Insert: {
          automacao_id?: string | null
          created_at?: string
          id?: string
          label?: string
          payload?: Json
          tenant_id?: string | null
        }
        Update: {
          automacao_id?: string | null
          created_at?: string
          id?: string
          label?: string
          payload?: Json
          tenant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "webhook_tests_automacao_id_fkey"
            columns: ["automacao_id"]
            isOneToOne: false
            referencedRelation: "automacoes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "webhook_tests_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_tenant: { Args: { _user_id: string }; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "master_admin" | "admin" | "user"
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
    Enums: {
      app_role: ["master_admin", "admin", "user"],
    },
  },
} as const

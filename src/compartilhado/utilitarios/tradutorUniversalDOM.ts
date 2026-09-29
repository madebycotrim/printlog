/**
 * Tradutor Universal do DOM para PrintLog
 * 
 * Permite tradução em tempo real de qualquer texto em qualquer página ou componente,
 * mesmo que o componente possua texto fixo (hardcoded) no JSX.
 * 
 * Utiliza WeakMap para armazenar o texto original de cada TextNode, garantindo
 * reversibilidade perfeita para pt-BR e preservando referências do Virtual DOM do React.
 */

type IdiomaDestino = "en-US" | "es-ES";

interface EntradaDicionario {
  en: string;
  es: string;
}

// Dicionário extensivo cobrindo todos os módulos do PrintLog
const DICIONARIO_GLOBAL: Record<string, EntradaDicionario> = {
  // === AUTENTICAÇÃO E BRANDING ===
  "Sua Farm,": { en: "Your Print Farm,", es: "Su Print Farm," },
  "Lucro Real.": { en: "Real Profit.", es: "Beneficio Real." },
  "Controle total sobre custos, materiais e produção. Deixe o PrintLog calcular enquanto você cria.": {
    en: "Complete control over costs, materials, and production. Let PrintLog calculate while you create.",
    es: "Control total sobre costes, materiales y producción. Deje que PrintLog calcule mientras usted crea."
  },
  "Precificação automática em segundos": {
    en: "Automated pricing in seconds",
    es: "Precios automáticos en segundos"
  },
  "Gestão inteligente de filamentos": {
    en: "Smart filament and inventory management",
    es: "Gestión inteligente de filamentos"
  },
  "Dashboard de performance financeira": {
    en: "Financial performance dashboard",
    es: "Panel de rendimiento financiero"
  },
  "Segurança e Privacidade": { en: "Security and Privacy", es: "Seguridad y Privacidad" },
  "Acesse ou Crie sua conta": { en: "Sign In or Create Account", es: "Inicie Sesión o Cree su Cuenta" },
  "O PrintLog utiliza a autenticação segura do Google e GitHub para login ou cadastro simplificado em poucos cliques.": {
    en: "PrintLog uses secure Google and GitHub authentication for simple sign-in in just a few clicks.",
    es: "PrintLog utiliza autenticación segura de Google y GitHub para iniciar sesión o registrarse en pocos clics."
  },
  "Continuar com Google": { en: "Continue with Google", es: "Continuar con Google" },
  "Continuar com GitHub": { en: "Continue with GitHub", es: "Continuar con GitHub" },
  "Continuar com E-mail": { en: "Continue with Email", es: "Continuar con Correo" },
  "Seu melhor e-mail corporativo": { en: "Your business email address", es: "Su mejor correo electrónico" },
  "Ao continuar, você concorda com nossos": { en: "By continuing, you agree to our", es: "Al continuar, usted acepta nuestros" },
  "Termos de Serviço": { en: "Terms of Service", es: "Términos de Servicio" },
  "e com a": { en: "and our", es: "y la" },
  "Política de Privacidade": { en: "Privacy Policy", es: "Política de Privacidad" },
  "em conformidade com a LGPD (Art. 7º, V).": {
    en: "in compliance with privacy regulations (GDPR / LGPD).",
    es: "en conformidad con las normas de privacidad (LGPD)."
  },
  "Voltar ao site": { en: "Back to website", es: "Volver al sitio web" },
  "Preparando sua Farm...": { en: "Preparing your Print Farm...", es: "Preparando su Print Farm..." },

  // === AÇÕES E BOTÕES GERAIS ===
  "Salvar": { en: "Save", es: "Guardar" },
  "Salvar Alterações": { en: "Save Changes", es: "Guardar Cambios" },
  "Salvando...": { en: "Saving...", es: "Guardando..." },
  "Cancelar": { en: "Cancel", es: "Cancelar" },
  "Excluir": { en: "Delete", es: "Eliminar" },
  "Editar": { en: "Edit", es: "Editar" },
  "Novo": { en: "New", es: "Nuevo" },
  "Adicionar": { en: "Add", es: "Añadir" },
  "Remover": { en: "Remove", es: "Quitar" },
  "Confirmar": { en: "Confirm", es: "Confirmar" },
  "Descartar": { en: "Discard", es: "Descartar" },
  "Fechar": { en: "Close", es: "Cerrar" },
  "Voltar": { en: "Back", es: "Volver" },
  "Avançar": { en: "Next", es: "Avanzar" },
  "Continuar": { en: "Continue", es: "Continuar" },
  "Concluir": { en: "Complete", es: "Concluir" },
  "Concluído": { en: "Completed", es: "Completado" },
  "Filtrar": { en: "Filter", es: "Filtrar" },
  "Filtros": { en: "Filters", es: "Filtros" },
  "Limpar": { en: "Clear", es: "Limpiar" },
  "Limpar busca": { en: "Clear search", es: "Limpiar búsqueda" },
  "Buscar": { en: "Search", es: "Buscar" },
  "Buscar...": { en: "Search...", es: "Buscar..." },
  "Pesquisar": { en: "Search", es: "Buscar" },
  "Visualizar": { en: "View", es: "Visualizar" },
  "Detalhes": { en: "Details", es: "Detalles" },
  "Exportar": { en: "Export", es: "Exportar" },
  "Importar": { en: "Import", es: "Importar" },
  "Baixar": { en: "Download", es: "Descargar" },
  "Baixar PDF": { en: "Download PDF", es: "Descargar PDF" },
  "Compartilhar": { en: "Share", es: "Compartir" },
  "Copiar Link": { en: "Copy Link", es: "Copiar Enlace" },
  "Ações": { en: "Actions", es: "Acciones" },
  "Status": { en: "Status", es: "Estado" },
  "Ativo": { en: "Active", es: "Activo" },
  "Inativo": { en: "Inactive", es: "Inactivo" },
  "Pendente": { en: "Pending", es: "Pendiente" },
  "Carregando...": { en: "Loading...", es: "Cargando..." },
  "Carregando": { en: "Loading", es: "Cargando" },
  "Sucesso": { en: "Success", es: "Éxito" },
  "Erro": { en: "Error", es: "Error" },
  "Atenção": { en: "Attention", es: "Atención" },
  "Total": { en: "Total", es: "Total" },
  "Subtotal": { en: "Subtotal", es: "Subtotal" },
  "Sair": { en: "Sign Out", es: "Cerrar Sesión" },
  "Sair da Conta": { en: "Sign Out", es: "Cerrar Sesión" },

  // === NAVEGAÇÃO E GRUPOS ===
  "Geral": { en: "General", es: "General" },
  "Produção": { en: "Production", es: "Producción" },
  "Comercial": { en: "Commercial", es: "Comercial" },
  "Sistema": { en: "System", es: "Sistema" },
  "Dashboard": { en: "Dashboard", es: "Panel de Control" },
  "Calculadora": { en: "Calculator", es: "Calculadora" },
  "Projetos": { en: "Projects", es: "Proyectos" },
  "Impressoras": { en: "3D Printers", es: "Impresoras 3D" },
  "Materiais": { en: "Materials", es: "Materiales" },
  "Insumos": { en: "Supplies", es: "Insumos" },
  "Clientes": { en: "Clients", es: "Clientes" },
  "Financeiro": { en: "Financial", es: "Financiero" },
  "Configurações": { en: "Settings", es: "Configuración" },
  "Central Maker": { en: "Maker Hub", es: "Centro Maker" },
  "Painel Master": { en: "Master Panel", es: "Panel Master" },

  // === COMERCIAL / CLIENTES ===
  "Ecossistema de Clientes": { en: "Customer Ecosystem", es: "Ecosistema de Clientes" },
  "Gestão comercial, CRM e acompanhamento de parceiros": {
    en: "Commercial management, CRM and client tracking",
    es: "Gestión comercial, CRM y seguimiento de clientes"
  },
  "Novo Cliente": { en: "New Client", es: "Nuevo Cliente" },
  "Cadastrar Cliente": { en: "Register Client", es: "Registrar Cliente" },
  "Editar Cliente": { en: "Edit Client", es: "Editar Cliente" },
  "Excluir Cliente": { en: "Delete Client", es: "Eliminar Cliente" },
  "Base de Clientes": { en: "Customer Base", es: "Base de Clientes" },
  "Novos Clientes": { en: "New Clients", es: "Nuevos Clientes" },
  "Volume de Pedidos": { en: "Order Volume", es: "Volumen de Pedidos" },
  "Receita Total": { en: "Total Revenue", es: "Ingresos Totales" },
  "parceiros ativos": { en: "active partners", es: "socios activos" },
  "entradas este mês": { en: "new this month", es: "entradas este mes" },
  "projetos entregues": { en: "delivered projects", es: "proyectos entregados" },
  "faturamento LTV": { en: "LTV revenue", es: "facturación LTV" },
  "Pesquisar por nome, e-mail ou status...": {
    en: "Search by name, email or status...",
    es: "Buscar por nombre, correo o estado..."
  },
  "Nenhum cliente cadastrado": { en: "No clients registered yet", es: "Ningún cliente registrado" },
  "Nenhum cliente encontrado": { en: "No clients found", es: "Ningún cliente encontrado" },
  "Tente ajustar os filtros ou cadastrar um novo cliente": {
    en: "Try adjusting filters or registering a new client",
    es: "Intente ajustar los filtros o registrar un nuevo cliente"
  },
  "Nome": { en: "Name", es: "Nombre" },
  "Nome Completo": { en: "Full Name", es: "Nombre Completo" },
  "Telefone": { en: "Phone", es: "Teléfono" },
  "WhatsApp": { en: "WhatsApp", es: "WhatsApp" },
  "E-mail": { en: "Email", es: "Correo" },
  "Documento": { en: "Document", es: "Documento" },
  "CPF / CNPJ": { en: "Tax ID / SSN", es: "NIF / CIF" },
  "Endereço": { en: "Address", es: "Dirección" },
  "Cidade": { en: "City", es: "Ciudad" },
  "Estado": { en: "State", es: "Provincia / Estado" },
  "CEP": { en: "Zip Code", es: "Código Postal" },
  "Observações": { en: "Notes", es: "Observaciones" },
  "Histórico de Pedidos": { en: "Order History", es: "Historial de Pedidos" },
  "Total de Projetos": { en: "Total Projects", es: "Total de Proyectos" },

  // === PRODUÇÃO & 3D PRINTING ===
  "Fila de Impressão": { en: "Print Queue", es: "Cola de Impresión" },
  "Adicionar à Fila": { en: "Add to Queue", es: "Añadir a la Cola" },
  "Em Produção": { en: "In Production", es: "En Producción" },
  "Aguardando": { en: "Waiting", es: "En Espera" },
  "Aguardando Início": { en: "Pending Start", es: "Esperando Inicio" },
  "Cancelado": { en: "Cancelled", es: "Cancelado" },
  "Falha": { en: "Failure", es: "Fallo" },
  "Pausado": { en: "Paused", es: "Pausado" },
  "Tempo de Impressão": { en: "Print Time", es: "Tiempo de Impresión" },
  "Tempo Estimado": { en: "Estimated Time", es: "Tiempo Estimado" },
  "Horas": { en: "Hours", es: "Horas" },
  "Minutos": { en: "Minutes", es: "Minutos" },
  "Peso": { en: "Weight", es: "Peso" },
  "Consumo": { en: "Consumption", es: "Consumo" },
  "Consumo Filamento": { en: "Filament Used", es: "Consumo de Filamento" },
  "Filamento": { en: "Filament", es: "Filamento" },
  "Filamentos": { en: "Filaments", es: "Filamentos" },
  "Resina": { en: "Resin", es: "Resina" },
  "Resinas": { en: "Resins", es: "Resinas" },
  "Estoque": { en: "Inventory", es: "Stock" },
  "Em estoque": { en: "In stock", es: "En stock" },
  "Esgotado": { en: "Out of stock", es: "Agotado" },
  "Estoque Baixo": { en: "Low Stock", es: "Stock Bajo" },
  "Reposição": { en: "Restock", es: "Reposición" },
  "Reposição de Estoque": { en: "Restock Inventory", es: "Reposición de Stock" },
  "Alerta de Estoque": { en: "Stock Alert", es: "Alerta de Stock" },
  "Alertas Estoque": { en: "Stock Alerts", es: "Alertas de Stock" },
  "Patrimônio": { en: "Asset Value", es: "Patrimonio" },
  "Valor em Estoque": { en: "Inventory Value", es: "Valor en Stock" },
  "Total Impresso": { en: "Total Printed", es: "Total Impreso" },
  "Taxa Sucesso": { en: "Success Rate", es: "Tasa de Éxito" },
  "Produção Ativa": { en: "Active Production", es: "Producción Activa" },
  "Pedidos Ativos": { en: "Active Orders", es: "Pedidos Activos" },
  "Bico": { en: "Nozzle", es: "Boquilla" },
  "Mesa": { en: "Bed", es: "Cama" },
  "Extrusora": { en: "Extruder", es: "Extrusor" },
  "Camada": { en: "Layer", es: "Capa" },
  "Altura de Camada": { en: "Layer Height", es: "Altura de Capa" },
  "Preenchimento": { en: "Infill", es: "Relleno" },
  "Temperatura": { en: "Temperature", es: "Temperatura" },
  "Velocidade": { en: "Speed", es: "Velocidad" },
  "Bobina": { en: "Spool", es: "Bobina" },
  "Carretel": { en: "Spool", es: "Carrete" },
  "Marca": { en: "Brand", es: "Marca" },
  "Modelo": { en: "Model", es: "Modelo" },
  "Fabricante": { en: "Manufacturer", es: "Fabricante" },
  "Cor": { en: "Color", es: "Color" },
  "Tipo": { en: "Type", es: "Tipo" },
  "Custo por Kg": { en: "Cost per Kg", es: "Coste por Kg" },
  "Custo por Grama": { en: "Cost per Gram", es: "Coste por Gramo" },
  "Preço de Venda": { en: "Sale Price", es: "Precio de Venta" },
  "Margem de Lucro": { en: "Profit Margin", es: "Margen de Beneficio" },
  "Lucro": { en: "Profit", es: "Beneficio" },
  "Lucro Estimado": { en: "Estimated Profit", es: "Beneficio Estimado" },

  // === FINANCEIRO ===
  "Fluxo Financeiro": { en: "Financial Flow", es: "Flujo Financiero" },
  "Gestão de receitas, custos operacionais, despesas e DRE": {
    en: "Revenue, operating costs, expenses, and P&L management",
    es: "Gestión de ingresos, costes operativos, gastos y pérdidas y ganancias"
  },
  "Novo Lançamento": { en: "New Transaction", es: "Nuevo Movimiento" },
  "Lançamentos": { en: "Transactions", es: "Movimientos" },
  "Faturamento Total": { en: "Total Revenue", es: "Facturación Total" },
  "Faturamento": { en: "Revenue", es: "Facturación" },
  "Receita": { en: "Income", es: "Ingreso" },
  "Receitas": { en: "Incomes", es: "Ingresos" },
  "Despesa": { en: "Expense", es: "Gasto" },
  "Despesas": { en: "Expenses", es: "Gastos" },
  "Lucro Líquido": { en: "Net Profit", es: "Beneficio Neto" },
  "Lucro Acumulado": { en: "Accumulated Profit", es: "Beneficio Acumulado" },
  "Ticket Médio": { en: "Average Ticket", es: "Ticket Medio" },
  "Potencial": { en: "Pipeline", es: "Potencial" },
  "ROI Estimado": { en: "Estimated ROI", es: "ROI Estimado" },
  "DRE": { en: "P&L Statement", es: "Estado de Resultados" },
  "Entrada": { en: "Inflow", es: "Entrada" },
  "Saída": { en: "Outflow", es: "Salida" },
  "Data": { en: "Date", es: "Fecha" },
  "Data de Vencimento": { en: "Due Date", es: "Fecha de Vencimiento" },
  "Data de Pagamento": { en: "Payment Date", es: "Fecha de Pago" },
  "Pago": { en: "Paid", es: "Pagado" },
  "A Pagar": { en: "To Pay", es: "Por Pagar" },
  "A Receber": { en: "To Receive", es: "Por Cobrar" },
  "Atrasado": { en: "Overdue", es: "Atrasado" },
  "Forma de Pagamento": { en: "Payment Method", es: "Forma de Pago" },
  "Categoria": { en: "Category", es: "Categoría" },
  "Descrição": { en: "Description", es: "Descripción" },
  "Valor": { en: "Value", es: "Valor" },

  // === CALCULADORA ===
  "Calculadora 3D": { en: "3D Calculator", es: "Calculadora 3D" },
  "Calculadora de Impressão 3D": { en: "3D Printing Calculator", es: "Calculadora de Impresión 3D" },
  "Orçamento Rápido": { en: "Quick Quote", es: "Presupuesto Rápido" },
  "Gerar Orçamento": { en: "Generate Quote", es: "Generar Presupuesto" },
  "Custo de Energia": { en: "Energy Cost", es: "Coste de Energía" },
  "Hora Máquina": { en: "Machine Hour", es: "Hora Máquina" },
  "Hora Operador": { en: "Operator Hour", es: "Hora Operario" },
  "Custo do Material": { en: "Material Cost", es: "Coste del Material" },
  "Custo Total": { en: "Total Cost", es: "Coste Total" },
  "Preço Sugerido": { en: "Suggested Price", es: "Precio Sugerido" },
  "Preço Final": { en: "Final Price", es: "Precio Final" },
  "Calcular Preço": { en: "Calculate Price", es: "Calcular Precio" },
  "Otimizar Preço com IA": { en: "Optimize Price with AI", es: "Optimizar Precio con IA" },
  "Imprimir Orçamento": { en: "Print Quote", es: "Imprimir Presupuesto" },

  // === CONFIGURAÇÕES & CONTA ===
  "Perfil": { en: "Profile", es: "Perfil" },
  "Estúdio": { en: "Studio", es: "Estudio" },
  "Aparência": { en: "Appearance", es: "Apariencia" },
  "Idioma": { en: "Language", es: "Idioma" },
  "Segurança": { en: "Security", es: "Seguridad" },
  "Privacidade": { en: "Privacy", es: "Privacidad" },
  "Assinatura": { en: "Subscription", es: "Suscripción" },
  "Tema Claro": { en: "Light Mode", es: "Modo Claro" },
  "Tema Escuro": { en: "Dark Mode", es: "Modo Oscuro" },
  "Automático": { en: "System Default", es: "Automático" },
  "Nome do Estúdio": { en: "Studio Name", es: "Nombre del Estudio" },
  "Slogan do Estúdio": { en: "Studio Slogan", es: "Slogan del Estudio" },
  "Logo do Estúdio": { en: "Studio Logo", es: "Logo del Estudio" },
  "Plano Gratuito": { en: "Free Plan", es: "Plan Gratuito" },
  "Plano PRO": { en: "PRO Plan", es: "Plan PRO" },
  "Membro Fundador": { en: "Founder Member", es: "Miembro Fundador" },
  "Alterar Senha": { en: "Change Password", es: "Cambiar Contraseña" },
  "Verificar E-mail": { en: "Verify Email", es: "Verificar Correo" },

  // === PLACEHOLDERS COMUNS ===
  "PESQUISAR EM TODA A PLATAFORMA...": {
    en: "SEARCH ACROSS THE ENTIRE PLATFORM...",
    es: "BUSCAR EN TODA LA PLATAFORMA..."
  },
  "BUSCAR...": { en: "SEARCH...", es: "BUSCAR..." },
  "Buscar por nome, e-mail ou telefone...": {
    en: "Search by name, email or phone...",
    es: "Buscar por nombre, correo o teléfono..."
  },
  "Digite o nome...": { en: "Type a name...", es: "Escriba un nombre..." },
  "Digite o e-mail...": { en: "Type an email...", es: "Escriba un correo..." },
  "Digite o telefone...": { en: "Type a phone...", es: "Escriba un teléfono..." },
  "Selecione uma opção": { en: "Select an option", es: "Seleccione una opción" },
};

// Tags e elementos que NUNCA devem ser tocados
const TAGS_IGNORADAS = new Set([
  "SCRIPT",
  "STYLE",
  "NOSCRIPT",
  "CODE",
  "PRE",
  "TEXTAREA",
]);

class MotorTradutorUniversalDOM {
  private idiomaAtivo: string = "pt-BR";
  private mapaNosOriginais = new WeakMap<Node, string>();
  private mapaAttrOriginais = new WeakMap<Element, Record<string, string>>();
  private observer: MutationObserver | null = null;
  private agendamentoId: number | null = null;
  private ativo: boolean = false;

  constructor() {
    if (typeof window !== "undefined") {
      this.iniciarObserver();
    }
  }

  /**
   * Define o idioma ativo e traduz ou restaura o DOM
   */
  public definirIdioma(idioma: string) {
    this.idiomaAtivo = idioma;

    if (idioma === "pt-BR") {
      this.ativo = false;
      this.restaurar();
    } else if (idioma === "en-US" || idioma === "es-ES") {
      this.ativo = true;
      this.traduzirTudo();
    }
  }

  /**
   * Restaura todos os textos e atributos para a versão original em português
   */
  public restaurar() {
    const walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT,
      null
    );

    let no: Node | null;
    while ((no = walker.nextNode())) {
      if (this.mapaNosOriginais.has(no)) {
        const textoOriginal = this.mapaNosOriginais.get(no)!;
        if (no.textContent !== textoOriginal) {
          no.textContent = textoOriginal;
        }
      }
    }

    // Restaura placeholders e titles
    const elementosComInput = document.querySelectorAll<HTMLElement>("input, textarea, button, a");
    elementosComInput.forEach((el) => {
      const originais = this.mapaAttrOriginais.get(el);
      if (originais) {
        if (originais.placeholder && (el as HTMLInputElement).placeholder !== undefined) {
          (el as HTMLInputElement).placeholder = originais.placeholder;
        }
        if (originais.title && el.title !== undefined) {
          el.title = originais.title;
        }
      }
    });
  }

  /**
   * Traduz todos os nós de texto e placeholders do DOM para o idioma ativo
   */
  public traduzirTudo() {
    if (!this.ativo || !document.body) return;

    const idiomaChave: IdiomaDestino = this.idiomaAtivo === "es-ES" ? "es-ES" : "en-US";
    const subChave = idiomaChave === "es-ES" ? "es" : "en";

    const walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode: (node) => {
          const pai = node.parentElement;
          if (!pai || TAGS_IGNORADAS.has(pai.tagName)) return NodeFilter.FILTER_REJECT;
          if (pai.isContentEditable) return NodeFilter.FILTER_REJECT;
          if (pai.closest("#btn-seletor-idioma")) return NodeFilter.FILTER_REJECT;
          const texto = node.textContent?.trim();
          if (!texto || texto.length < 2) return NodeFilter.FILTER_REJECT;
          return NodeFilter.FILTER_ACCEPT;
        },
      }
    );

    let no: Node | null;
    while ((no = walker.nextNode())) {
      this.processarNoTexto(no, subChave);
    }

    // Traduz atributos comuns como placeholders e titles
    const elementos = document.querySelectorAll<HTMLInputElement | HTMLButtonElement>("input[placeholder], button[title], a[title]");
    elementos.forEach((el) => {
      this.processarAtributos(el, subChave);
    });
  }

  /**
   * Traduz um nó de texto individual preservando pontuação e espaços
   */
  private processarNoTexto(no: Node, subChave: "en" | "es") {
    let original = this.mapaNosOriginais.get(no);
    if (!original) {
      original = no.textContent || "";
      this.mapaNosOriginais.set(no, original);
    }

    const traduzido = this.traduzirTexto(original, subChave);
    if (traduzido !== original && no.textContent !== traduzido) {
      no.textContent = traduzido;
    }
  }

  /**
   * Traduz placeholders e titles de elementos de formulário
   */
  private processarAtributos(el: HTMLElement, subChave: "en" | "es") {
    let guardados = this.mapaAttrOriginais.get(el);
    if (!guardados) {
      guardados = {};
      if ((el as HTMLInputElement).placeholder) {
        guardados.placeholder = (el as HTMLInputElement).placeholder;
      }
      if (el.title) {
        guardados.title = el.title;
      }
      this.mapaAttrOriginais.set(el, guardados);
    }

    if (guardados.placeholder) {
      const traduzido = this.traduzirTexto(guardados.placeholder, subChave);
      if ((el as HTMLInputElement).placeholder !== traduzido) {
        (el as HTMLInputElement).placeholder = traduzido;
      }
    }

    if (guardados.title) {
      const traduzido = this.traduzirTexto(guardados.title, subChave);
      if (el.title !== traduzido) {
        el.title = traduzido;
      }
    }
  }

  /**
   * Aplica matching inteligente: busca exata, case insensitive e substituição de termos
   */
  private traduzirTexto(textoOriginal: string, subChave: "en" | "es"): string {
    const textoAparado = textoOriginal.trim();
    if (!textoAparado) return textoOriginal;

    // 1. Busca direta exata
    const direto = DICIONARIO_GLOBAL[textoAparado];
    if (direto) {
      return textoOriginal.replace(textoAparado, direto[subChave]);
    }

    // 2. Busca ignorando maiúsculas/minúsculas
    const minusculo = textoAparado.toLowerCase();
    for (const [pt, traducoes] of Object.entries(DICIONARIO_GLOBAL)) {
      if (pt.toLowerCase() === minusculo) {
        const subst = traducoes[subChave];
        // Preserva se era todo maiúsculo (ex: "NOVO CLIENTE" -> "NEW CLIENT")
        if (textoAparado === textoAparado.toUpperCase() && textoAparado.length > 2) {
          return textoOriginal.replace(textoAparado, subst.toUpperCase());
        }
        return textoOriginal.replace(textoAparado, subst);
      }
    }

    // 3. Substituição de termos conhecidos dentro de sentenças maiores
    let resultado = textoOriginal;
    for (const [termoPt, traducoes] of Object.entries(DICIONARIO_GLOBAL)) {
      if (termoPt.length > 3 && resultado.includes(termoPt)) {
        resultado = resultado.split(termoPt).join(traducoes[subChave]);
      }
    }

    return resultado;
  }

  /**
   * Monitora novas adições ao DOM (navegação entre rotas, abertura de modais)
   */
  private iniciarObserver() {
    this.observer = new MutationObserver(() => {
      if (!this.ativo) return;

      if (this.agendamentoId !== null) {
        cancelAnimationFrame(this.agendamentoId);
      }

      this.agendamentoId = requestAnimationFrame(() => {
        this.traduzirTudo();
        this.agendamentoId = null;
      });
    });

    if (document.body) {
      this.observer.observe(document.body, {
        childList: true,
        subtree: true,
        characterData: false,
      });
    } else {
      window.addEventListener("DOMContentLoaded", () => {
        this.observer?.observe(document.body, {
          childList: true,
          subtree: true,
          characterData: false,
        });
      });
    }
  }
}

export const tradutorUniversalDOM = new MotorTradutorUniversalDOM();

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
    en: "in compliance with LGPD (Art. 7, V).",
    es: "en conformidad con la LGPD (Art. 7º, V)."
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
  "Condições do Ambiente de Impressão": { en: "Printing Environment Conditions", es: "Condiciones del Entorno de Impresión" },
  "Erro ao carregar clima local": { en: "Error loading local weather", es: "Error al cargar el clima local" },
  "Exemplo de Temperatura:": { en: "Temperature Example:", es: "Ejemplo de Temperatura:" },
  "Exemplo de Temp.:": { en: "Temp. Example:", es: "Ejemplo de Temp.:" },
  "Filamentos (FDM)": { en: "Filaments (FDM)", es: "Filamentos (FDM)" },
  "Resinas (SLA)": { en: "Resins (SLA)", es: "Resinas (SLA)" },
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
  "Adaptação Automática de Formatos": { en: "Automatic Format Adaptation", es: "Adaptación Automática de Formatos" },
  "ADAPTAÇÃO AUTOMÁTICA DE FORMATOS": { en: "AUTOMATIC FORMAT ADAPTATION", es: "ADAPTACIÓN AUTOMÁTICA DE FORMATOS" },
  "Exemplo de Moeda:": { en: "Currency Example:", es: "Ejemplo de Moneda:" },
  "Exemplo de Moeda": { en: "Currency Example", es: "Ejemplo de Moneda" },
  "Exemplo de Data:": { en: "Date Example:", es: "Ejemplo de Fecha:" },
  "Exemplo de Data": { en: "Date Example", es: "Ejemplo de Fecha" },
  "Ao alternar o idioma, datas, moedas e termos operacionais são ajustados instantaneamente sem recarregar a página e ficam salvos no seu navegador.": {
    en: "When switching languages, dates, currencies, and operational terms are instantly adjusted without reloading and saved to your browser.",
    es: "Al cambiar el idioma, las fechas, monedas y términos operativos se ajustan instantáneamente sin recargar la página y se guardan en su navegador."
  },
  "Câmbio Comercial Oficial:": { en: "Official Exchange Rate:", es: "Tipo de Cambio Oficial:" },

  // === CABEÇALHOS DE PÁGINAS ===
  "Fluxo de Produção": { en: "Production Flow", es: "Flujo de Producción" },
  "Gerencie seus pedidos no Kanban": {
    en: "Manage your orders in the Kanban board",
    es: "Gestione sus pedidos en el tablero Kanban"
  },
  "Fila de Produção": { en: "Print Queue", es: "Cola de Producción" },
  "Sequenciamento visual e planejamento de impressões por máquina": {
    en: "Visual sequencing and machine print job scheduling",
    es: "Secuenciación visual y planificación de impresiones por máquina"
  },
  "Minhas Impressoras": { en: "My 3D Printers", es: "Mis Impresoras 3D" },
  "Gerencie seu parque de máquinas": {
    en: "Manage your printer fleet and maintenance",
    es: "Gestione su parque de máquinas y mantenimiento"
  },
  "Meus Materiais": { en: "My Materials", es: "Mis Materiales" },
  "Gestão de filamentos, resinas e patrimônio técnico": {
    en: "Filament, resin and technical asset inventory",
    es: "Gestión de filamentos, resinas y patrimonio técnico"
  },
  "Meus Insumos": { en: "My Supplies", es: "Mis Insumos" },
  "Gerencie peças e outros materiais logísticos": {
    en: "Manage parts and logistics materials",
    es: "Gestione piezas y otros materiales logísticos"
  },
  "Fluxo de Caixa": { en: "Cash Flow", es: "Flujo de Caja" },
  "Acompanhamento detalhado de rentabilidade e saúde financeira": {
    en: "Detailed profitability and financial health tracking",
    es: "Seguimiento detallado de rentabilidad y salud financiera"
  },
  "Agenda de Manutenção Preditiva": { en: "Predictive Maintenance Schedule", es: "Agenda de Mantenimiento Predictivo" },
  "Evite paradas não planejadas monitorando a saúde do seu parque.": {
    en: "Prevent unplanned downtime by monitoring fleet health.",
    es: "Evite paradas no planificadas monitoreando la salud de su parque."
  },
  "Gestão operacional e proteção de dados (LGPD)": {
    en: "Operational management and data privacy (LGPD)",
    es: "Gestión operativa y protección de datos (LGPD)"
  },
  "Salvando alterações em background...": {
    en: "Saving changes in background...",
    es: "Guardando cambios en segundo plano..."
  },
  "Todas as alterações foram salvas automaticamente": {
    en: "All changes were automatically saved",
    es: "Todos los cambios se guardaron automáticamente"
  },
  "Calculadora de Custos": { en: "Cost Calculator", es: "Calculadora de Costes" },
  "Editando Precificação": { en: "Editing Pricing", es: "Editando Precios" },
  "Motor de Orçamentação Avançado": { en: "Advanced Quotation Engine", es: "Motor de Presupuestos Avanzado" },
  "Visão Geral e Métricas em Tempo Real": { en: "Overview & Real-Time Metrics", es: "Visión General y Métricas en Tiempo Real" },

  // === BOTÕES DE AÇÃO DO CABEÇALHO ===
  "Novo Cadastro": { en: "New Client", es: "Nuevo Registro" },
  "Novo Cadastro Manual": { en: "New Manual Client", es: "Nuevo Registro Manual" },
  "Nova Máquina": { en: "New Printer", es: "Nueva Máquina" },
  "Novo Material": { en: "New Material", es: "Nuevo Material" },
  "Novo Insumo": { en: "New Supply", es: "Nuevo Insumo" },
  "Novo Pedido": { en: "New Order", es: "Nuevo Pedido" },
  "Registrar Transação": { en: "Record Transaction", es: "Registrar Transacción" },

  // === ESTADOS VAZIOS (EMPTY STATES) ===
  "Nenhum cliente no radar": { en: "No clients on radar", es: "Ningún cliente en el radar" },
  "Sua base de clientes está vazia. Comece cadastrando um cliente VIP para iniciar seu ecossistema.": {
    en: "Your customer base is empty. Start by registering a VIP customer to kick off your ecosystem.",
    es: "Su base de clientes está vacía. Comience registrando un cliente VIP para iniciar su ecosistema."
  },
  "Nenhum pedido na fila": { en: "No orders in queue", es: "Ningún pedido en cola" },
  "Nenhuma impressora cadastrada": { en: "No 3D printers registered", es: "Ninguna impresora registrada" },
  "Cadastre sua primeira impressora para calcular custos reais de depreciação e energia.": {
    en: "Register your first printer to calculate real depreciation and energy costs.",
    es: "Registre su primera impresora para calcular costes reales de depreciación y energía."
  },
  "Nenhum material cadastrado": { en: "No materials registered", es: "Ningún material registrado" },
  "Cadastre seus filamentos e resinas para controle automático de estoque e precificação.": {
    en: "Register your filaments and resins for automated inventory and pricing control.",
    es: "Registre sus filamentos y resinas para control automático de stock y precios."
  },
  "Nenhum insumo cadastrado": { en: "No supplies registered", es: "Ningún insumo registrado" },
  "Nenhuma transação encontrada": { en: "No transactions found", es: "Ninguna transacción encontrada" },
  "Nenhum registro": { en: "No records", es: "Ningún registro" },

  // === DASHBOARD WIDGETS ===
  "Orçamentos Recentes": { en: "Recent Quotes", es: "Presupuestos Recientes" },
  "VER TODOS": { en: "VIEW ALL", es: "VER TODOS" },
  "Ver Todos": { en: "View All", es: "Ver Todos" },
  "Ver todos": { en: "View all", es: "Ver todos" },
  "Quadro de Avisos": { en: "Notice Board", es: "Tablón de Anuncios" },
  "Tudo sob controle.": { en: "All under control.", es: "Todo bajo control." },
  "Nenhum aviso no quadro.": { en: "No notices on board.", es: "Ningún aviso en el tablón." },
  "Tudo sob controle. Nenhum aviso no quadro.": { en: "All under control. No notices on the board.", es: "Todo bajo control. Ningún aviso en el tablón." },
  "VERIFICAR AGORA": { en: "CHECK NOW", es: "VERIFICAR AHORA" },
  "MAKER FUNDADOR": { en: "FOUNDER MAKER", es: "CREADOR FUNDADOR" },
  "Maker Fundador": { en: "Founder Maker", es: "Creador Fundador" },
  "Manutenção Necessária": { en: "Maintenance Required", es: "Mantenimiento Requerido" },
  "AGENDAR AGORA": { en: "SCHEDULE NOW", es: "PROGRAMAR AHORA" },
  "Insumos Críticos": { en: "Critical Supplies", es: "Insumos Críticos" },
  "Monitor de Reposição": { en: "Replenishment Monitor", es: "Monitor de Reposición" },
  "Materiais Críticos": { en: "Critical Materials", es: "Materiales Críticos" },
  "Status de Matéria-Prima": { en: "Raw Material Status", es: "Estado de Materias Primas" },
  "REPOR": { en: "RESTOCK", es: "REPONER" },
  "Repor": { en: "Restock", es: "Reponer" },
  "Estoque em dia": { en: "Stock up to date", es: "Stock al día" },
  "Sem máquinas ativas": { en: "No active machines", es: "Sin máquinas activas" },
  "PRONTA": { en: "READY", es: "LISTA" },
  "EM CURSO": { en: "IN PROGRESS", es: "EN CURSO" },
  "EM REVISÃO": { en: "UNDER REVIEW", es: "EN REVISIÓN" },
  "Novo Orçamento": { en: "New Quote", es: "Nuevo Presupuesto" },
  "Ver Fila de Produção": { en: "View Print Queue", es: "Ver Cola de Producción" },
  "Repor Material (Filamento)": { en: "Restock Material (Filament)", es: "Reponer Material (Filamento)" },
  "Repor Insumo (Resina/Peças)": { en: "Restock Supply (Resin/Parts)", es: "Reponer Insumo (Resina/Piezas)" },
  "Status das Máquinas": { en: "Machine Status", es: "Estado de las Máquinas" },
  "Registrar Lançamento": { en: "Record Transaction", es: "Registrar Movimiento" },

  // === LANDING PAGE ===
  "Benefícios": { en: "Benefits", es: "Beneficios" },
  "Demonstração": { en: "Demo", es: "Demostración" },
  "Preços": { en: "Pricing", es: "Precios" },
  "Ir para o Dashboard": { en: "Go to Dashboard", es: "Ir al Panel" },
  "Entrar": { en: "Sign In", es: "Iniciar Sesión" },
  "Criar Conta": { en: "Create Account", es: "Crear Cuenta" },
  "Contato": { en: "Contact", es: "Contacto" },
  "Começar Grátis": { en: "Start Free", es: "Comenzar Gratis" },
  "Começar Agora": { en: "Get Started Now", es: "Comenzar Ahora" },
  "Assinar Plano PRO": { en: "Subscribe to PRO Plan", es: "Suscribirse al Plan PRO" },
  "DINHEIRO FORA": { en: "MONEY AWAY", es: "EL DINERO" },
  "Demonstração do Sistema": { en: "System Demo", es: "Demostración del Sistema" },
  "O Cérebro da sua": { en: "The Brain Behind Your", es: "El Cerebro de su" },
  "Operação de Impressão.": { en: "3D Printing Operations.", es: "Operación de Impresión." },
  "Painel de Controle": { en: "Control Panel", es: "Panel de Control" },
  "Faturado Mês": { en: "Monthly Revenue", es: "Facturado Mes" },
  "Precisão Custos": { en: "Cost Accuracy", es: "Precisión de Costes" },
  "Lucro Real Médio": { en: "Avg Real Profit", es: "Beneficio Real Medio" },
  "Zero": { en: "Zero", es: "Cero" },
  "Chutômetro": { en: "Guesswork", es: "Estimaciones a ojo" },
  "Compromisso Ético PrintLog": { en: "PrintLog Ethical Commitment", es: "Compromiso Ético PrintLog" },
  "Oferta de Lançamento": { en: "Launch Offer", es: "Oferta de Lanzamiento" },
  "Gratuito": { en: "Free", es: "Gratuito" },
  "sempre": { en: "forever", es: "siempre" },
  "tempo limitado": { en: "limited time", es: "tiempo limitado" },
  "Escolha o Plano Ideal para sua": { en: "Choose the Ideal Plan for Your", es: "Elija el Plan Ideal para su" },
  "MAIS QUE UM SOFTWARE,": { en: "MORE THAN SOFTWARE,", es: "MÁS QUE UN SOFTWARE," },
  "UMA MISSÃO.": { en: "A MISSION.", es: "UNA MISIÓN." },
  "Feito por Makers, Para Makers — Junte-se à Missão": {
    en: "Made by Makers, For Makers — Join the Mission",
    es: "Hecho por Makers, Para Makers — Únase a la Misión"
  },
  "Acesso total gratuito para quem apoia o início do projeto": {
    en: "Full free access for everyone supporting the launch",
    es: "Acceso total gratuito para quienes apoyan el inicio del proyecto"
  },
  "Precificação Errada": { en: "Wrong Pricing", es: "Precios Incorrectos" },
  "Energia Ignorada": { en: "Ignored Energy", es: "Energía Ignorada" },
  "Falhas de Impressão": { en: "Print Failures", es: "Fallos de Impresión" },
  "Estoque Parado": { en: "Idle Inventory", es: "Stock Parado" },
  "Manutenção Reativa": { en: "Reactive Maintenance", es: "Mantenimiento Reactivo" },
  "Desperdício Oculto": { en: "Hidden Waste", es: "Desperdicio Oculto" },
  "Branding de Estúdio": { en: "Studio Branding", es: "Branding de Estudio" },
  "Gestão Manual": { en: "Manual Management", es: "Gestión Manual" },
  "Todos os direitos reservados.": { en: "All rights reserved.", es: "Todos los derechos reservados." },
  "Sistema de gestão para makers 3D. Calcule com precisão seus custos de impressão e maximize seus lucros.": {
    en: "Management platform for 3D makers. Accurately calculate printing costs and maximize your profits.",
    es: "Sistema de gestión para makers 3D. Calcule con precisión sus costes de impresión y maximice sus beneficios."
  },
  "Política de Cookies": { en: "Cookie Policy", es: "Política de Cookies" },

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
  private mapaUltimasTraducoes = new WeakMap<Node, string>();
  private mapaAttrOriginais = new WeakMap<Element, Record<string, string>>();
  private observer: MutationObserver | null = null;
  private agendamentoId: number | null = null;
  private ativo: boolean = false;
  private processandoMutacao: boolean = false;

  constructor() {
    if (typeof window !== "undefined") {
      this.iniciarObserver();
    }
  }

  public getIdiomaAtivo(): string {
    return this.idiomaAtivo;
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
          if (
            pai.closest("#btn-seletor-idioma") ||
            pai.closest('[data-seletor-idioma="true"]') ||
            pai.closest('[data-sonner-toaster]')
          ) return NodeFilter.FILTER_REJECT;
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
    const atual = no.textContent || "";
    const ultimaTrad = this.mapaUltimasTraducoes.get(no);

    // Se o nó ainda não foi mapeado OU o React renderizou um novo texto diferente da nossa tradução
    if (!original || (atual && atual !== ultimaTrad && atual !== original)) {
      original = atual;
      this.mapaNosOriginais.set(no, original);
    }

    const traduzido = this.traduzirTexto(original, subChave);
    if (traduzido !== original && no.textContent !== traduzido) {
      this.mapaUltimasTraducoes.set(no, traduzido);
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
   * Aplica matching inteligente: busca exata, case insensitive e tratamento de prefixos/sufixos
   * NUNCA substitui termos parciais dentro de frases para evitar misturas bizarras (ex: "Back ao site" ou "+ New Cadastro")
   */
  public traduzirTexto(textoOriginal: string, subChave: "en" | "es"): string {
    if (!textoOriginal) return textoOriginal;
    const textoAparado = textoOriginal.trim();
    if (!textoAparado) return textoOriginal;

    // 1. Identificar e extrair decoradores/prefixos e sufixos comuns (ex: "+ ", "-> ", "...", ":")
    let prefixo = "";
    let sufixo = "";
    let conteudo = textoAparado;

    // Prefixo tipo "+ ", "• ", "- ", "> "
    const matchPrefixo = conteudo.match(/^([+•\->\s]+)\s*/);
    if (matchPrefixo && matchPrefixo[1].length < conteudo.length) {
      prefixo = matchPrefixo[0];
      conteudo = conteudo.substring(prefixo.length).trim();
    }

    // Sufixo tipo " ->", "...", ":", "!", "?"
    const matchSufixo = conteudo.match(/\s*([:\-!?>]+|\.{3})$/);
    if (matchSufixo && matchSufixo[0].length < conteudo.length) {
      sufixo = matchSufixo[0];
      conteudo = conteudo.substring(0, conteudo.length - sufixo.length).trim();
    }

    // 2. Busca direta exata no dicionário
    const direto = DICIONARIO_GLOBAL[conteudo];
    if (direto) {
      const traducao = direto[subChave];
      const formatada = conteudo === conteudo.toUpperCase() && conteudo.length > 2
        ? traducao.toUpperCase()
        : traducao;
      return textoOriginal.replace(textoAparado, `${prefixo}${formatada}${sufixo}`);
    }

    // 3. Busca case-insensitive
    const minusculo = conteudo.toLowerCase();
    for (const [pt, traducoes] of Object.entries(DICIONARIO_GLOBAL)) {
      if (pt.toLowerCase() === minusculo) {
        const subst = traducoes[subChave];
        const formatada = conteudo === conteudo.toUpperCase() && conteudo.length > 2
          ? subst.toUpperCase()
          : subst;
        return textoOriginal.replace(textoAparado, `${prefixo}${formatada}${sufixo}`);
      }
    }

    // 4. Tratamento de padrões numéricos dinâmicos (ex: "Últimas 5 interações")
    const matchInteracoes = conteudo.match(/^últimas?\s+(\d+)\s+interações?$/i);
    if (matchInteracoes) {
      const n = matchInteracoes[1];
      const trad = subChave === "es" 
        ? `Últimas ${n} interacciones` 
        : `Last ${n} interactions`;
      const formatada = conteudo === conteudo.toUpperCase() ? trad.toUpperCase() : trad;
      return textoOriginal.replace(textoAparado, `${prefixo}${formatada}${sufixo}`);
    }

    // 5. Se não encontrou correspondência no dicionário, JAMAIS quebra ou mutila a frase.
    // Retorna o texto original como um bloco íntegro.
    return textoOriginal;
  }

  /**
   * Monitora adições e alterações ao DOM (navegação, re-renders do React, modais)
   */
  private iniciarObserver() {
    this.observer = new MutationObserver(() => {
      if (!this.ativo || this.processandoMutacao) return;

      if (this.agendamentoId !== null) {
        cancelAnimationFrame(this.agendamentoId);
      }

      this.agendamentoId = requestAnimationFrame(() => {
        this.processandoMutacao = true;
        this.traduzirTudo();
        this.processandoMutacao = false;
        this.agendamentoId = null;
      });
    });

    const config: MutationObserverInit = {
      childList: true,
      subtree: true,
      characterData: true,
    };

    if (document.body) {
      this.observer.observe(document.body, config);
    } else {
      window.addEventListener("DOMContentLoaded", () => {
        this.observer?.observe(document.body, config);
      });
    }
  }
}

export const tradutorUniversalDOM = new MotorTradutorUniversalDOM();

/**
 * Função utilitária global para tradução síncrona dentro de componentes React
 * Garante que qualquer texto passado para cabeçalho, empty state ou widget
 * seja renderizado no idioma correto sem depender do DOM mutation observer.
 */
export function traduzirTextoGlobal(texto?: string | null): string {
  if (!texto) return texto || "";
  const idioma = tradutorUniversalDOM.getIdiomaAtivo() || (typeof localStorage !== "undefined" ? localStorage.getItem("printlog_idioma") : "pt-BR") || "pt-BR";
  if (idioma === "pt-BR") return texto;
  const subChave: "en" | "es" = idioma.startsWith("es") ? "es" : "en";
  return tradutorUniversalDOM.traduzirTexto(texto, subChave);
}

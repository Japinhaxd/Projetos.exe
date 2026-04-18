import type { SupportedLanguage } from '../types';

export const LANG_META: {
  code: SupportedLanguage;
  flag: string;
  name: string;
  native: string;
}[] = [
  { code: 'pt-BR', flag: '🇧🇷', name: 'Portuguese (Brazil)', native: 'Português' },
  { code: 'en-US', flag: '🇺🇸', name: 'English', native: 'English' },
  { code: 'es', flag: '🇪🇸', name: 'Spanish', native: 'Español' },
  { code: 'fr', flag: '🇫🇷', name: 'French', native: 'Français' },
  { code: 'de', flag: '🇩🇪', name: 'German', native: 'Deutsch' },
  { code: 'it', flag: '🇮🇹', name: 'Italian', native: 'Italiano' },
  { code: 'zh', flag: '🇨🇳', name: 'Chinese', native: '中文' },
  { code: 'ja', flag: '🇯🇵', name: 'Japanese', native: '日本語' },
];

export type TranslationKey =
  | 'app.tagline'
  | 'app.continueGoogle'
  | 'app.continueMicrosoft'
  | 'app.localOnly'
  | 'app.localModeLink'
  | 'app.setupFirebase'
  | 'app.setupFirebaseDesc'
  | 'app.pasteConfig'
  | 'app.saveContinue'
  | 'app.cancel'
  | 'app.logout'
  | 'nav.dashboard'
  | 'nav.transactions'
  | 'nav.analytics'
  | 'nav.cashflow'
  | 'nav.budgets'
  | 'nav.accounts'
  | 'nav.settings'
  | 'common.save'
  | 'common.cancel'
  | 'common.delete'
  | 'common.edit'
  | 'common.create'
  | 'common.close'
  | 'common.search'
  | 'common.filter'
  | 'common.all'
  | 'common.add'
  | 'common.amount'
  | 'common.category'
  | 'common.account'
  | 'common.date'
  | 'common.description'
  | 'common.tags'
  | 'common.type'
  | 'common.actions'
  | 'common.income'
  | 'common.expense'
  | 'common.transfer'
  | 'common.balance'
  | 'common.total'
  | 'common.net'
  | 'common.yes'
  | 'common.no'
  | 'common.loading'
  | 'common.name'
  | 'common.confirm'
  | 'common.export'
  | 'common.import'
  | 'common.none'
  | 'common.daily'
  | 'common.weekly'
  | 'common.monthly'
  | 'common.recurrence'
  | 'common.netWorth'
  | 'common.progress'
  | 'common.limit'
  | 'common.spent'
  | 'common.remaining'
  | 'common.over'
  | 'common.empty'
  | 'dashboard.title'
  | 'dashboard.totalBalance'
  | 'dashboard.monthlyIncome'
  | 'dashboard.monthlyExpenses'
  | 'dashboard.netThisMonth'
  | 'dashboard.balanceOverTime'
  | 'dashboard.expenseByCategory'
  | 'dashboard.incomeVsExpenses'
  | 'dashboard.recentTransactions'
  | 'dashboard.noTransactions'
  | 'dashboard.startByAdding'
  | 'transactions.title'
  | 'transactions.new'
  | 'transactions.edit'
  | 'transactions.split'
  | 'transactions.splitDesc'
  | 'transactions.part'
  | 'transactions.addPart'
  | 'transactions.totalParts'
  | 'transactions.splitMismatch'
  | 'transactions.bulkActions'
  | 'transactions.selected'
  | 'transactions.recategorize'
  | 'transactions.deleteSelected'
  | 'transactions.exportCSV'
  | 'transactions.noResults'
  | 'transactions.searchPlaceholder'
  | 'transactions.dateRange'
  | 'transactions.from'
  | 'transactions.to'
  | 'transactions.transferTo'
  | 'analytics.title'
  | 'analytics.heatmap'
  | 'analytics.heatmapDesc'
  | 'analytics.breakdown'
  | 'analytics.topCategories'
  | 'analytics.mom'
  | 'analytics.averageDaily'
  | 'analytics.rollingAverage'
  | 'analytics.biggestExpense'
  | 'analytics.mostFrequent'
  | 'analytics.percentOfTotal'
  | 'cashflow.title'
  | 'cashflow.waterfall'
  | 'cashflow.projected'
  | 'cashflow.upcoming'
  | 'cashflow.nextDays'
  | 'cashflow.noUpcoming'
  | 'cashflow.inflows'
  | 'cashflow.outflows'
  | 'cashflow.projectedBalance'
  | 'budgets.title'
  | 'budgets.new'
  | 'budgets.healthScore'
  | 'budgets.onTrack'
  | 'budgets.atRisk'
  | 'budgets.exceeded'
  | 'budgets.empty'
  | 'budgets.limitAmount'
  | 'accounts.title'
  | 'accounts.new'
  | 'accounts.initialBalance'
  | 'accounts.color'
  | 'accounts.cash'
  | 'accounts.checking'
  | 'accounts.savings'
  | 'accounts.credit'
  | 'accounts.investment'
  | 'accounts.currentBalance'
  | 'accounts.connectedBanks'
  | 'accounts.connectBank'
  | 'accounts.connectYourBank'
  | 'accounts.supportedBanks'
  | 'accounts.connectOpenFinance'
  | 'accounts.credentialsDisclaimer'
  | 'accounts.lastSynced'
  | 'accounts.syncNow'
  | 'accounts.securedBy'
  | 'accounts.noPluggyKeys'
  | 'accounts.pluggyCta'
  | 'accounts.openSettings'
  | 'accounts.syncing'
  | 'accounts.justNow'
  | 'accounts.minutesAgo'
  | 'accounts.hoursAgo'
  | 'accounts.daysAgo'
  | 'settings.title'
  | 'settings.appearance'
  | 'settings.language'
  | 'settings.account'
  | 'settings.integrations'
  | 'settings.data'
  | 'settings.themeDark'
  | 'settings.themeLight'
  | 'settings.firebaseConfig'
  | 'settings.firebaseHelp'
  | 'settings.pluggyKeys'
  | 'settings.pluggyClientId'
  | 'settings.pluggyClientSecret'
  | 'settings.pluggyHelp'
  | 'settings.exportJSON'
  | 'settings.importJSON'
  | 'settings.clearData'
  | 'settings.clearConfirm'
  | 'settings.clearConfirmDesc'
  | 'settings.recurring'
  | 'settings.noRecurring'
  | 'settings.loggedInAs'
  | 'settings.notLoggedIn'
  | 'settings.localModeActive'
  | 'categories.Food'
  | 'categories.Transport'
  | 'categories.Housing'
  | 'categories.Health'
  | 'categories.Entertainment'
  | 'categories.Salary'
  | 'categories.Investment'
  | 'categories.Other'
  | 'toast.saved'
  | 'toast.deleted'
  | 'toast.imported'
  | 'toast.exported'
  | 'toast.cleared'
  | 'toast.syncSuccess'
  | 'toast.syncError'
  | 'toast.invalidJSON'
  | 'toast.invalidFirebase'
  | 'toast.loggedOut'
  | 'toast.missingPluggy';

type Dict = Record<TranslationKey, string>;

const pt_BR: Dict = {
  'app.tagline': 'Seu sistema operacional financeiro pessoal',
  'app.continueGoogle': 'Continuar com Google',
  'app.continueMicrosoft': 'Continuar com Microsoft',
  'app.localOnly': 'Seus dados ficam armazenados localmente no seu dispositivo',
  'app.localModeLink': 'Continuar sem login (modo local)',
  'app.setupFirebase': 'Configurar autenticação',
  'app.setupFirebaseDesc':
    'Para habilitar o login, cole a configuração do seu projeto Firebase abaixo',
  'app.pasteConfig': 'Cole aqui o JSON de configuração (firebaseConfig)',
  'app.saveContinue': 'Salvar e continuar',
  'app.cancel': 'Cancelar',
  'app.logout': 'Sair',
  'nav.dashboard': 'Dashboard',
  'nav.transactions': 'Transações',
  'nav.analytics': 'Analytics',
  'nav.cashflow': 'Fluxo de Caixa',
  'nav.budgets': 'Orçamentos',
  'nav.accounts': 'Contas',
  'nav.settings': 'Configurações',
  'common.save': 'Salvar',
  'common.cancel': 'Cancelar',
  'common.delete': 'Excluir',
  'common.edit': 'Editar',
  'common.create': 'Criar',
  'common.close': 'Fechar',
  'common.search': 'Buscar',
  'common.filter': 'Filtrar',
  'common.all': 'Todos',
  'common.add': 'Adicionar',
  'common.amount': 'Valor',
  'common.category': 'Categoria',
  'common.account': 'Conta',
  'common.date': 'Data',
  'common.description': 'Descrição',
  'common.tags': 'Tags',
  'common.type': 'Tipo',
  'common.actions': 'Ações',
  'common.income': 'Receita',
  'common.expense': 'Despesa',
  'common.transfer': 'Transferência',
  'common.balance': 'Saldo',
  'common.total': 'Total',
  'common.net': 'Líquido',
  'common.yes': 'Sim',
  'common.no': 'Não',
  'common.loading': 'Carregando...',
  'common.name': 'Nome',
  'common.confirm': 'Confirmar',
  'common.export': 'Exportar',
  'common.import': 'Importar',
  'common.none': 'Nenhuma',
  'common.daily': 'Diária',
  'common.weekly': 'Semanal',
  'common.monthly': 'Mensal',
  'common.recurrence': 'Recorrência',
  'common.netWorth': 'Patrimônio líquido',
  'common.progress': 'Progresso',
  'common.limit': 'Limite',
  'common.spent': 'Gasto',
  'common.remaining': 'Restante',
  'common.over': 'Ultrapassado',
  'common.empty': 'Vazio',
  'dashboard.title': 'Dashboard',
  'dashboard.totalBalance': 'Saldo Total',
  'dashboard.monthlyIncome': 'Receita Mensal',
  'dashboard.monthlyExpenses': 'Despesas Mensais',
  'dashboard.netThisMonth': 'Líquido do Mês',
  'dashboard.balanceOverTime': 'Evolução do saldo (12 meses)',
  'dashboard.expenseByCategory': 'Despesas por categoria',
  'dashboard.incomeVsExpenses': 'Receitas × Despesas (6 meses)',
  'dashboard.recentTransactions': 'Transações recentes',
  'dashboard.noTransactions': 'Nenhuma transação ainda',
  'dashboard.startByAdding': 'Comece adicionando uma transação',
  'transactions.title': 'Transações',
  'transactions.new': 'Nova transação',
  'transactions.edit': 'Editar transação',
  'transactions.split': 'Dividir transação',
  'transactions.splitDesc':
    'Divida esta transação em várias partes com categorias diferentes',
  'transactions.part': 'Parte',
  'transactions.addPart': 'Adicionar parte',
  'transactions.totalParts': 'Total das partes',
  'transactions.splitMismatch': 'A soma das partes deve ser igual ao valor total',
  'transactions.bulkActions': 'Ações em massa',
  'transactions.selected': 'selecionadas',
  'transactions.recategorize': 'Recategorizar',
  'transactions.deleteSelected': 'Excluir selecionadas',
  'transactions.exportCSV': 'Exportar CSV',
  'transactions.noResults': 'Nenhum resultado encontrado',
  'transactions.searchPlaceholder': 'Buscar por descrição, categoria, tag...',
  'transactions.dateRange': 'Período',
  'transactions.from': 'De',
  'transactions.to': 'Até',
  'transactions.transferTo': 'Para conta',
  'analytics.title': 'Analytics',
  'analytics.heatmap': 'Intensidade de gastos',
  'analytics.heatmapDesc': 'Gastos por dia nos últimos 3 meses',
  'analytics.breakdown': 'Distribuição por categoria',
  'analytics.topCategories': 'Top 5 categorias',
  'analytics.mom': 'Comparação mês a mês',
  'analytics.averageDaily': 'Média diária de gastos',
  'analytics.rollingAverage': 'Média móvel (30 dias)',
  'analytics.biggestExpense': 'Maior despesa',
  'analytics.mostFrequent': 'Mais frequente',
  'analytics.percentOfTotal': '% do total',
  'cashflow.title': 'Fluxo de Caixa',
  'cashflow.waterfall': 'Fluxo em cascata',
  'cashflow.projected': 'Saldo projetado (30 dias)',
  'cashflow.upcoming': 'Recorrentes nos próximos 7 dias',
  'cashflow.nextDays': 'próximos dias',
  'cashflow.noUpcoming': 'Nenhuma transação recorrente próxima',
  'cashflow.inflows': 'Entradas',
  'cashflow.outflows': 'Saídas',
  'cashflow.projectedBalance': 'Saldo projetado',
  'budgets.title': 'Orçamentos',
  'budgets.new': 'Novo orçamento',
  'budgets.healthScore': 'Saúde dos orçamentos',
  'budgets.onTrack': 'No alvo',
  'budgets.atRisk': 'Em risco',
  'budgets.exceeded': 'Ultrapassado',
  'budgets.empty': 'Nenhum orçamento definido',
  'budgets.limitAmount': 'Limite mensal',
  'accounts.title': 'Contas',
  'accounts.new': 'Nova conta',
  'accounts.initialBalance': 'Saldo inicial',
  'accounts.color': 'Cor',
  'accounts.cash': 'Dinheiro',
  'accounts.checking': 'Conta Corrente',
  'accounts.savings': 'Poupança',
  'accounts.credit': 'Cartão de Crédito',
  'accounts.investment': 'Investimento',
  'accounts.currentBalance': 'Saldo atual',
  'accounts.connectedBanks': 'Bancos conectados',
  'accounts.connectBank': '+ Conectar banco',
  'accounts.connectYourBank': 'Conecte seu banco',
  'accounts.supportedBanks': 'Bancos suportados',
  'accounts.connectOpenFinance': 'Conectar via Open Finance',
  'accounts.credentialsDisclaimer':
    'Suas credenciais vão diretamente para o seu banco. O Finance OS nunca vê sua senha.',
  'accounts.lastSynced': 'Última sincronização',
  'accounts.syncNow': 'Sincronizar',
  'accounts.securedBy': 'Protegido pelo Open Finance Brasil',
  'accounts.noPluggyKeys':
    'Configure suas chaves Pluggy nas Configurações para conectar um banco.',
  'accounts.pluggyCta': 'Conecte seu banco com o Pluggy (opcional)',
  'accounts.openSettings': 'Abrir configurações',
  'accounts.syncing': 'Sincronizando...',
  'accounts.justNow': 'agora mesmo',
  'accounts.minutesAgo': 'min atrás',
  'accounts.hoursAgo': 'h atrás',
  'accounts.daysAgo': 'd atrás',
  'settings.title': 'Configurações',
  'settings.appearance': 'Aparência',
  'settings.language': 'Idioma',
  'settings.account': 'Conta',
  'settings.integrations': 'Integrações',
  'settings.data': 'Dados',
  'settings.themeDark': 'Modo escuro',
  'settings.themeLight': 'Modo claro',
  'settings.firebaseConfig': 'Configuração Firebase',
  'settings.firebaseHelp':
    'Cole o objeto firebaseConfig do seu projeto para habilitar login social.',
  'settings.pluggyKeys': 'Chaves do Pluggy',
  'settings.pluggyClientId': 'CLIENT_ID',
  'settings.pluggyClientSecret': 'CLIENT_SECRET',
  'settings.pluggyHelp':
    '1. Crie uma conta grátis em pluggy.ai · 2. Pegue suas chaves no dashboard · 3. Cole aqui · 4. Vá em Contas → Conectar banco',
  'settings.exportJSON': 'Exportar tudo como JSON',
  'settings.importJSON': 'Importar de JSON',
  'settings.clearData': 'Apagar todos os dados',
  'settings.clearConfirm': 'Apagar todos os dados?',
  'settings.clearConfirmDesc':
    'Esta ação não pode ser desfeita. Todas as transações, contas e orçamentos serão perdidos.',
  'settings.recurring': 'Transações recorrentes',
  'settings.noRecurring': 'Nenhuma transação recorrente',
  'settings.loggedInAs': 'Logado como',
  'settings.notLoggedIn': 'Não autenticado',
  'settings.localModeActive': 'Modo local ativo',
  'categories.Food': 'Alimentação',
  'categories.Transport': 'Transporte',
  'categories.Housing': 'Moradia',
  'categories.Health': 'Saúde',
  'categories.Entertainment': 'Lazer',
  'categories.Salary': 'Salário',
  'categories.Investment': 'Investimento',
  'categories.Other': 'Outros',
  'toast.saved': 'Salvo com sucesso',
  'toast.deleted': 'Excluído com sucesso',
  'toast.imported': 'Dados importados',
  'toast.exported': 'Dados exportados',
  'toast.cleared': 'Dados apagados',
  'toast.syncSuccess': 'Sincronização concluída',
  'toast.syncError': 'Erro ao sincronizar',
  'toast.invalidJSON': 'JSON inválido',
  'toast.invalidFirebase': 'Configuração Firebase inválida',
  'toast.loggedOut': 'Você saiu',
  'toast.missingPluggy': 'Configure as chaves do Pluggy primeiro',
};

const en_US: Dict = {
  'app.tagline': 'Your personal financial OS',
  'app.continueGoogle': 'Continue with Google',
  'app.continueMicrosoft': 'Continue with Microsoft',
  'app.localOnly': 'Your data is stored locally on your device',
  'app.localModeLink': 'Continue without login (local mode)',
  'app.setupFirebase': 'Set up authentication',
  'app.setupFirebaseDesc':
    'To enable login, paste your Firebase project config below',
  'app.pasteConfig': 'Paste your firebaseConfig JSON here',
  'app.saveContinue': 'Save & Continue',
  'app.cancel': 'Cancel',
  'app.logout': 'Log out',
  'nav.dashboard': 'Dashboard',
  'nav.transactions': 'Transactions',
  'nav.analytics': 'Analytics',
  'nav.cashflow': 'Cash Flow',
  'nav.budgets': 'Budgets',
  'nav.accounts': 'Accounts',
  'nav.settings': 'Settings',
  'common.save': 'Save',
  'common.cancel': 'Cancel',
  'common.delete': 'Delete',
  'common.edit': 'Edit',
  'common.create': 'Create',
  'common.close': 'Close',
  'common.search': 'Search',
  'common.filter': 'Filter',
  'common.all': 'All',
  'common.add': 'Add',
  'common.amount': 'Amount',
  'common.category': 'Category',
  'common.account': 'Account',
  'common.date': 'Date',
  'common.description': 'Description',
  'common.tags': 'Tags',
  'common.type': 'Type',
  'common.actions': 'Actions',
  'common.income': 'Income',
  'common.expense': 'Expense',
  'common.transfer': 'Transfer',
  'common.balance': 'Balance',
  'common.total': 'Total',
  'common.net': 'Net',
  'common.yes': 'Yes',
  'common.no': 'No',
  'common.loading': 'Loading...',
  'common.name': 'Name',
  'common.confirm': 'Confirm',
  'common.export': 'Export',
  'common.import': 'Import',
  'common.none': 'None',
  'common.daily': 'Daily',
  'common.weekly': 'Weekly',
  'common.monthly': 'Monthly',
  'common.recurrence': 'Recurrence',
  'common.netWorth': 'Net worth',
  'common.progress': 'Progress',
  'common.limit': 'Limit',
  'common.spent': 'Spent',
  'common.remaining': 'Remaining',
  'common.over': 'Over',
  'common.empty': 'Empty',
  'dashboard.title': 'Dashboard',
  'dashboard.totalBalance': 'Total Balance',
  'dashboard.monthlyIncome': 'Monthly Income',
  'dashboard.monthlyExpenses': 'Monthly Expenses',
  'dashboard.netThisMonth': 'Net this Month',
  'dashboard.balanceOverTime': 'Balance over time (12 months)',
  'dashboard.expenseByCategory': 'Expenses by category',
  'dashboard.incomeVsExpenses': 'Income vs Expenses (6 months)',
  'dashboard.recentTransactions': 'Recent transactions',
  'dashboard.noTransactions': 'No transactions yet',
  'dashboard.startByAdding': 'Get started by adding a transaction',
  'transactions.title': 'Transactions',
  'transactions.new': 'New transaction',
  'transactions.edit': 'Edit transaction',
  'transactions.split': 'Split transaction',
  'transactions.splitDesc':
    'Split this transaction into multiple parts with different categories',
  'transactions.part': 'Part',
  'transactions.addPart': 'Add part',
  'transactions.totalParts': 'Parts total',
  'transactions.splitMismatch': 'Sum of parts must equal the total amount',
  'transactions.bulkActions': 'Bulk actions',
  'transactions.selected': 'selected',
  'transactions.recategorize': 'Recategorize',
  'transactions.deleteSelected': 'Delete selected',
  'transactions.exportCSV': 'Export CSV',
  'transactions.noResults': 'No results',
  'transactions.searchPlaceholder': 'Search by description, category, tag...',
  'transactions.dateRange': 'Date range',
  'transactions.from': 'From',
  'transactions.to': 'To',
  'transactions.transferTo': 'Transfer to',
  'analytics.title': 'Analytics',
  'analytics.heatmap': 'Expense heatmap',
  'analytics.heatmapDesc': 'Daily spending over the last 3 months',
  'analytics.breakdown': 'Category breakdown',
  'analytics.topCategories': 'Top 5 categories',
  'analytics.mom': 'Month over month',
  'analytics.averageDaily': 'Average daily spend',
  'analytics.rollingAverage': '30-day rolling average',
  'analytics.biggestExpense': 'Biggest expense',
  'analytics.mostFrequent': 'Most frequent',
  'analytics.percentOfTotal': '% of total',
  'cashflow.title': 'Cash Flow',
  'cashflow.waterfall': 'Waterfall',
  'cashflow.projected': 'Projected balance (30 days)',
  'cashflow.upcoming': 'Upcoming in the next 7 days',
  'cashflow.nextDays': 'next days',
  'cashflow.noUpcoming': 'No upcoming recurring transactions',
  'cashflow.inflows': 'Inflows',
  'cashflow.outflows': 'Outflows',
  'cashflow.projectedBalance': 'Projected balance',
  'budgets.title': 'Budgets',
  'budgets.new': 'New budget',
  'budgets.healthScore': 'Budget health',
  'budgets.onTrack': 'On track',
  'budgets.atRisk': 'At risk',
  'budgets.exceeded': 'Exceeded',
  'budgets.empty': 'No budgets defined yet',
  'budgets.limitAmount': 'Monthly limit',
  'accounts.title': 'Accounts',
  'accounts.new': 'New account',
  'accounts.initialBalance': 'Initial balance',
  'accounts.color': 'Color',
  'accounts.cash': 'Cash',
  'accounts.checking': 'Checking',
  'accounts.savings': 'Savings',
  'accounts.credit': 'Credit Card',
  'accounts.investment': 'Investment',
  'accounts.currentBalance': 'Current balance',
  'accounts.connectedBanks': 'Connected banks',
  'accounts.connectBank': '+ Connect Bank Account',
  'accounts.connectYourBank': 'Connect your bank',
  'accounts.supportedBanks': 'Supported banks',
  'accounts.connectOpenFinance': 'Connect via Open Finance',
  'accounts.credentialsDisclaimer':
    'Your credentials go directly to your bank. Finance OS never sees your password.',
  'accounts.lastSynced': 'Last synced',
  'accounts.syncNow': 'Sync now',
  'accounts.securedBy': 'Secured by Open Finance Brasil',
  'accounts.noPluggyKeys':
    'Set your Pluggy keys in Settings to connect a bank.',
  'accounts.pluggyCta': 'Connect your bank with Pluggy (optional)',
  'accounts.openSettings': 'Open settings',
  'accounts.syncing': 'Syncing...',
  'accounts.justNow': 'just now',
  'accounts.minutesAgo': 'min ago',
  'accounts.hoursAgo': 'h ago',
  'accounts.daysAgo': 'd ago',
  'settings.title': 'Settings',
  'settings.appearance': 'Appearance',
  'settings.language': 'Language',
  'settings.account': 'Account',
  'settings.integrations': 'Integrations',
  'settings.data': 'Data',
  'settings.themeDark': 'Dark',
  'settings.themeLight': 'Light',
  'settings.firebaseConfig': 'Firebase Config',
  'settings.firebaseHelp':
    'Paste your Firebase project firebaseConfig object to enable social login.',
  'settings.pluggyKeys': 'Pluggy API Keys',
  'settings.pluggyClientId': 'CLIENT_ID',
  'settings.pluggyClientSecret': 'CLIENT_SECRET',
  'settings.pluggyHelp':
    '1. Create a free account at pluggy.ai · 2. Get your API keys · 3. Paste here · 4. Go to Accounts → Connect bank',
  'settings.exportJSON': 'Export all as JSON',
  'settings.importJSON': 'Import from JSON',
  'settings.clearData': 'Clear all data',
  'settings.clearConfirm': 'Clear all data?',
  'settings.clearConfirmDesc':
    'This cannot be undone. All transactions, accounts and budgets will be lost.',
  'settings.recurring': 'Recurring transactions',
  'settings.noRecurring': 'No recurring transactions',
  'settings.loggedInAs': 'Logged in as',
  'settings.notLoggedIn': 'Not logged in',
  'settings.localModeActive': 'Local mode active',
  'categories.Food': 'Food',
  'categories.Transport': 'Transport',
  'categories.Housing': 'Housing',
  'categories.Health': 'Health',
  'categories.Entertainment': 'Entertainment',
  'categories.Salary': 'Salary',
  'categories.Investment': 'Investment',
  'categories.Other': 'Other',
  'toast.saved': 'Saved successfully',
  'toast.deleted': 'Deleted successfully',
  'toast.imported': 'Data imported',
  'toast.exported': 'Data exported',
  'toast.cleared': 'Data cleared',
  'toast.syncSuccess': 'Sync complete',
  'toast.syncError': 'Sync failed',
  'toast.invalidJSON': 'Invalid JSON',
  'toast.invalidFirebase': 'Invalid Firebase config',
  'toast.loggedOut': 'You logged out',
  'toast.missingPluggy': 'Set your Pluggy keys first',
};

// Compact translations — for non-pt/en we auto-merge with en_US as fallback
// while overriding the most important strings in the native language.
const es: Partial<Dict> = {
  'app.tagline': 'Tu sistema operativo financiero personal',
  'app.continueGoogle': 'Continuar con Google',
  'app.continueMicrosoft': 'Continuar con Microsoft',
  'app.localOnly': 'Tus datos se almacenan localmente en tu dispositivo',
  'app.localModeLink': 'Continuar sin iniciar sesión (modo local)',
  'app.setupFirebase': 'Configurar autenticación',
  'app.setupFirebaseDesc':
    'Para habilitar el inicio de sesión, pega la configuración de tu proyecto Firebase',
  'app.saveContinue': 'Guardar y continuar',
  'app.cancel': 'Cancelar',
  'app.logout': 'Cerrar sesión',
  'nav.dashboard': 'Panel',
  'nav.transactions': 'Transacciones',
  'nav.analytics': 'Análisis',
  'nav.cashflow': 'Flujo de caja',
  'nav.budgets': 'Presupuestos',
  'nav.accounts': 'Cuentas',
  'nav.settings': 'Ajustes',
  'common.save': 'Guardar',
  'common.cancel': 'Cancelar',
  'common.delete': 'Eliminar',
  'common.edit': 'Editar',
  'common.search': 'Buscar',
  'common.amount': 'Importe',
  'common.category': 'Categoría',
  'common.account': 'Cuenta',
  'common.date': 'Fecha',
  'common.description': 'Descripción',
  'common.income': 'Ingreso',
  'common.expense': 'Gasto',
  'common.transfer': 'Transferencia',
  'common.balance': 'Saldo',
  'common.net': 'Neto',
  'common.total': 'Total',
  'common.add': 'Añadir',
  'common.netWorth': 'Patrimonio neto',
  'common.spent': 'Gastado',
  'common.limit': 'Límite',
  'common.remaining': 'Restante',
  'common.over': 'Excedido',
  'common.monthly': 'Mensual',
  'common.weekly': 'Semanal',
  'common.daily': 'Diario',
  'common.none': 'Ninguna',
  'common.recurrence': 'Recurrencia',
  'dashboard.totalBalance': 'Saldo total',
  'dashboard.monthlyIncome': 'Ingresos del mes',
  'dashboard.monthlyExpenses': 'Gastos del mes',
  'dashboard.netThisMonth': 'Neto del mes',
  'dashboard.balanceOverTime': 'Saldo a lo largo del tiempo (12 meses)',
  'dashboard.expenseByCategory': 'Gastos por categoría',
  'dashboard.incomeVsExpenses': 'Ingresos vs gastos (6 meses)',
  'dashboard.recentTransactions': 'Transacciones recientes',
  'dashboard.noTransactions': 'Aún no hay transacciones',
  'dashboard.startByAdding': 'Empieza añadiendo una transacción',
  'transactions.title': 'Transacciones',
  'transactions.new': 'Nueva transacción',
  'transactions.edit': 'Editar transacción',
  'transactions.split': 'Dividir transacción',
  'transactions.searchPlaceholder': 'Buscar por descripción, categoría, etiqueta...',
  'transactions.exportCSV': 'Exportar CSV',
  'transactions.noResults': 'Sin resultados',
  'analytics.title': 'Análisis',
  'cashflow.title': 'Flujo de caja',
  'budgets.title': 'Presupuestos',
  'budgets.new': 'Nuevo presupuesto',
  'budgets.empty': 'Aún no hay presupuestos',
  'budgets.limitAmount': 'Límite mensual',
  'budgets.healthScore': 'Salud de los presupuestos',
  'budgets.onTrack': 'En meta',
  'budgets.atRisk': 'En riesgo',
  'budgets.exceeded': 'Excedido',
  'accounts.title': 'Cuentas',
  'accounts.new': 'Nueva cuenta',
  'accounts.initialBalance': 'Saldo inicial',
  'accounts.cash': 'Efectivo',
  'accounts.checking': 'Cuenta corriente',
  'accounts.savings': 'Ahorros',
  'accounts.credit': 'Tarjeta de crédito',
  'accounts.investment': 'Inversión',
  'accounts.connectedBanks': 'Bancos conectados',
  'accounts.connectBank': '+ Conectar banco',
  'accounts.connectYourBank': 'Conecta tu banco',
  'accounts.syncNow': 'Sincronizar',
  'accounts.lastSynced': 'Última sincronización',
  'accounts.securedBy': 'Protegido por Open Finance',
  'settings.title': 'Ajustes',
  'settings.appearance': 'Apariencia',
  'settings.language': 'Idioma',
  'settings.themeDark': 'Oscuro',
  'settings.themeLight': 'Claro',
  'settings.data': 'Datos',
  'settings.integrations': 'Integraciones',
  'settings.account': 'Cuenta',
  'settings.exportJSON': 'Exportar todo como JSON',
  'settings.importJSON': 'Importar desde JSON',
  'settings.clearData': 'Borrar todos los datos',
  'settings.clearConfirm': '¿Borrar todos los datos?',
  'categories.Food': 'Comida',
  'categories.Transport': 'Transporte',
  'categories.Housing': 'Vivienda',
  'categories.Health': 'Salud',
  'categories.Entertainment': 'Ocio',
  'categories.Salary': 'Salario',
  'categories.Investment': 'Inversión',
  'categories.Other': 'Otros',
};

const fr: Partial<Dict> = {
  'app.tagline': 'Votre système d\'exploitation financier personnel',
  'app.continueGoogle': 'Continuer avec Google',
  'app.continueMicrosoft': 'Continuer avec Microsoft',
  'app.localOnly': 'Vos données sont stockées localement sur votre appareil',
  'app.localModeLink': 'Continuer sans connexion (mode local)',
  'app.logout': 'Se déconnecter',
  'nav.dashboard': 'Tableau de bord',
  'nav.transactions': 'Transactions',
  'nav.analytics': 'Analyses',
  'nav.cashflow': 'Trésorerie',
  'nav.budgets': 'Budgets',
  'nav.accounts': 'Comptes',
  'nav.settings': 'Paramètres',
  'common.save': 'Enregistrer',
  'common.cancel': 'Annuler',
  'common.delete': 'Supprimer',
  'common.edit': 'Modifier',
  'common.income': 'Revenu',
  'common.expense': 'Dépense',
  'common.transfer': 'Virement',
  'common.balance': 'Solde',
  'common.total': 'Total',
  'common.net': 'Net',
  'common.amount': 'Montant',
  'common.category': 'Catégorie',
  'common.account': 'Compte',
  'common.date': 'Date',
  'common.description': 'Description',
  'common.add': 'Ajouter',
  'common.monthly': 'Mensuel',
  'common.weekly': 'Hebdomadaire',
  'common.daily': 'Quotidien',
  'common.none': 'Aucune',
  'common.spent': 'Dépensé',
  'common.limit': 'Limite',
  'common.netWorth': 'Valeur nette',
  'dashboard.totalBalance': 'Solde total',
  'dashboard.monthlyIncome': 'Revenus du mois',
  'dashboard.monthlyExpenses': 'Dépenses du mois',
  'dashboard.netThisMonth': 'Net du mois',
  'dashboard.recentTransactions': 'Transactions récentes',
  'dashboard.balanceOverTime': 'Solde sur 12 mois',
  'dashboard.expenseByCategory': 'Dépenses par catégorie',
  'dashboard.incomeVsExpenses': 'Revenus vs dépenses (6 mois)',
  'transactions.title': 'Transactions',
  'transactions.new': 'Nouvelle transaction',
  'transactions.searchPlaceholder': 'Rechercher...',
  'analytics.title': 'Analyses',
  'cashflow.title': 'Trésorerie',
  'budgets.title': 'Budgets',
  'budgets.new': 'Nouveau budget',
  'accounts.title': 'Comptes',
  'accounts.new': 'Nouveau compte',
  'accounts.cash': 'Espèces',
  'accounts.checking': 'Compte courant',
  'accounts.savings': 'Épargne',
  'accounts.credit': 'Carte de crédit',
  'accounts.investment': 'Investissement',
  'accounts.connectedBanks': 'Banques connectées',
  'accounts.connectBank': '+ Connecter une banque',
  'settings.title': 'Paramètres',
  'settings.appearance': 'Apparence',
  'settings.language': 'Langue',
  'settings.themeDark': 'Sombre',
  'settings.themeLight': 'Clair',
  'settings.data': 'Données',
  'settings.integrations': 'Intégrations',
  'settings.account': 'Compte',
  'categories.Food': 'Alimentation',
  'categories.Transport': 'Transport',
  'categories.Housing': 'Logement',
  'categories.Health': 'Santé',
  'categories.Entertainment': 'Loisirs',
  'categories.Salary': 'Salaire',
  'categories.Investment': 'Investissement',
  'categories.Other': 'Autres',
};

const de: Partial<Dict> = {
  'app.tagline': 'Dein persönliches Finanzbetriebssystem',
  'app.continueGoogle': 'Mit Google fortfahren',
  'app.continueMicrosoft': 'Mit Microsoft fortfahren',
  'app.localOnly': 'Deine Daten werden lokal auf deinem Gerät gespeichert',
  'app.localModeLink': 'Ohne Anmeldung fortfahren (lokaler Modus)',
  'app.logout': 'Abmelden',
  'nav.dashboard': 'Übersicht',
  'nav.transactions': 'Transaktionen',
  'nav.analytics': 'Analyse',
  'nav.cashflow': 'Cashflow',
  'nav.budgets': 'Budgets',
  'nav.accounts': 'Konten',
  'nav.settings': 'Einstellungen',
  'common.save': 'Speichern',
  'common.cancel': 'Abbrechen',
  'common.delete': 'Löschen',
  'common.edit': 'Bearbeiten',
  'common.income': 'Einnahme',
  'common.expense': 'Ausgabe',
  'common.transfer': 'Überweisung',
  'common.balance': 'Saldo',
  'common.amount': 'Betrag',
  'common.category': 'Kategorie',
  'common.account': 'Konto',
  'common.date': 'Datum',
  'common.description': 'Beschreibung',
  'common.add': 'Hinzufügen',
  'common.net': 'Netto',
  'common.total': 'Gesamt',
  'common.monthly': 'Monatlich',
  'common.none': 'Keine',
  'dashboard.totalBalance': 'Gesamtsaldo',
  'dashboard.monthlyIncome': 'Monatliches Einkommen',
  'dashboard.monthlyExpenses': 'Monatliche Ausgaben',
  'dashboard.netThisMonth': 'Netto diesen Monat',
  'dashboard.recentTransactions': 'Letzte Transaktionen',
  'transactions.title': 'Transaktionen',
  'transactions.new': 'Neue Transaktion',
  'analytics.title': 'Analyse',
  'cashflow.title': 'Cashflow',
  'budgets.title': 'Budgets',
  'budgets.new': 'Neues Budget',
  'accounts.title': 'Konten',
  'accounts.new': 'Neues Konto',
  'accounts.cash': 'Bargeld',
  'accounts.checking': 'Girokonto',
  'accounts.savings': 'Sparkonto',
  'accounts.credit': 'Kreditkarte',
  'accounts.investment': 'Investition',
  'settings.title': 'Einstellungen',
  'settings.appearance': 'Design',
  'settings.language': 'Sprache',
  'settings.themeDark': 'Dunkel',
  'settings.themeLight': 'Hell',
  'settings.data': 'Daten',
  'categories.Food': 'Essen',
  'categories.Transport': 'Transport',
  'categories.Housing': 'Wohnen',
  'categories.Health': 'Gesundheit',
  'categories.Entertainment': 'Unterhaltung',
  'categories.Salary': 'Gehalt',
  'categories.Investment': 'Investition',
  'categories.Other': 'Sonstiges',
};

const it: Partial<Dict> = {
  'app.tagline': 'Il tuo sistema operativo finanziario personale',
  'app.continueGoogle': 'Continua con Google',
  'app.continueMicrosoft': 'Continua con Microsoft',
  'app.localOnly': 'I tuoi dati sono memorizzati localmente sul tuo dispositivo',
  'app.localModeLink': 'Continua senza accesso (modalità locale)',
  'app.logout': 'Esci',
  'nav.dashboard': 'Dashboard',
  'nav.transactions': 'Transazioni',
  'nav.analytics': 'Analisi',
  'nav.cashflow': 'Flusso di cassa',
  'nav.budgets': 'Budget',
  'nav.accounts': 'Conti',
  'nav.settings': 'Impostazioni',
  'common.save': 'Salva',
  'common.cancel': 'Annulla',
  'common.delete': 'Elimina',
  'common.edit': 'Modifica',
  'common.income': 'Entrata',
  'common.expense': 'Spesa',
  'common.transfer': 'Trasferimento',
  'common.balance': 'Saldo',
  'common.amount': 'Importo',
  'common.category': 'Categoria',
  'common.account': 'Conto',
  'common.date': 'Data',
  'common.description': 'Descrizione',
  'common.add': 'Aggiungi',
  'common.total': 'Totale',
  'common.net': 'Netto',
  'common.monthly': 'Mensile',
  'common.none': 'Nessuna',
  'dashboard.totalBalance': 'Saldo totale',
  'dashboard.monthlyIncome': 'Entrate mensili',
  'dashboard.monthlyExpenses': 'Spese mensili',
  'dashboard.netThisMonth': 'Netto del mese',
  'dashboard.recentTransactions': 'Transazioni recenti',
  'transactions.title': 'Transazioni',
  'transactions.new': 'Nuova transazione',
  'analytics.title': 'Analisi',
  'cashflow.title': 'Flusso di cassa',
  'budgets.title': 'Budget',
  'budgets.new': 'Nuovo budget',
  'accounts.title': 'Conti',
  'accounts.new': 'Nuovo conto',
  'accounts.cash': 'Contanti',
  'accounts.checking': 'Conto corrente',
  'accounts.savings': 'Risparmio',
  'accounts.credit': 'Carta di credito',
  'accounts.investment': 'Investimento',
  'settings.title': 'Impostazioni',
  'settings.appearance': 'Aspetto',
  'settings.language': 'Lingua',
  'settings.themeDark': 'Scuro',
  'settings.themeLight': 'Chiaro',
  'categories.Food': 'Cibo',
  'categories.Transport': 'Trasporti',
  'categories.Housing': 'Casa',
  'categories.Health': 'Salute',
  'categories.Entertainment': 'Intrattenimento',
  'categories.Salary': 'Stipendio',
  'categories.Investment': 'Investimento',
  'categories.Other': 'Altri',
};

const zh: Partial<Dict> = {
  'app.tagline': '您的个人金融操作系统',
  'app.continueGoogle': '使用 Google 继续',
  'app.continueMicrosoft': '使用 Microsoft 继续',
  'app.localOnly': '您的数据存储在本地设备上',
  'app.localModeLink': '不登录继续(本地模式)',
  'app.logout': '登出',
  'nav.dashboard': '仪表盘',
  'nav.transactions': '交易',
  'nav.analytics': '分析',
  'nav.cashflow': '现金流',
  'nav.budgets': '预算',
  'nav.accounts': '账户',
  'nav.settings': '设置',
  'common.save': '保存',
  'common.cancel': '取消',
  'common.delete': '删除',
  'common.edit': '编辑',
  'common.income': '收入',
  'common.expense': '支出',
  'common.transfer': '转账',
  'common.balance': '余额',
  'common.amount': '金额',
  'common.category': '类别',
  'common.account': '账户',
  'common.date': '日期',
  'common.description': '描述',
  'common.add': '添加',
  'common.total': '总计',
  'common.net': '净',
  'common.monthly': '每月',
  'common.none': '无',
  'dashboard.totalBalance': '总余额',
  'dashboard.monthlyIncome': '月收入',
  'dashboard.monthlyExpenses': '月支出',
  'dashboard.netThisMonth': '本月净值',
  'dashboard.recentTransactions': '最近交易',
  'transactions.title': '交易',
  'transactions.new': '新交易',
  'analytics.title': '分析',
  'cashflow.title': '现金流',
  'budgets.title': '预算',
  'budgets.new': '新预算',
  'accounts.title': '账户',
  'accounts.new': '新账户',
  'accounts.cash': '现金',
  'accounts.checking': '支票账户',
  'accounts.savings': '储蓄',
  'accounts.credit': '信用卡',
  'accounts.investment': '投资',
  'settings.title': '设置',
  'settings.appearance': '外观',
  'settings.language': '语言',
  'settings.themeDark': '深色',
  'settings.themeLight': '浅色',
  'categories.Food': '餐饮',
  'categories.Transport': '交通',
  'categories.Housing': '住房',
  'categories.Health': '健康',
  'categories.Entertainment': '娱乐',
  'categories.Salary': '工资',
  'categories.Investment': '投资',
  'categories.Other': '其他',
};

const ja: Partial<Dict> = {
  'app.tagline': 'あなたのパーソナル金融OS',
  'app.continueGoogle': 'Google で続ける',
  'app.continueMicrosoft': 'Microsoft で続ける',
  'app.localOnly': 'データはお使いのデバイスにローカル保存されます',
  'app.localModeLink': 'ログインせずに続ける(ローカルモード)',
  'app.logout': 'ログアウト',
  'nav.dashboard': 'ダッシュボード',
  'nav.transactions': '取引',
  'nav.analytics': '分析',
  'nav.cashflow': 'キャッシュフロー',
  'nav.budgets': '予算',
  'nav.accounts': '口座',
  'nav.settings': '設定',
  'common.save': '保存',
  'common.cancel': 'キャンセル',
  'common.delete': '削除',
  'common.edit': '編集',
  'common.income': '収入',
  'common.expense': '支出',
  'common.transfer': '振替',
  'common.balance': '残高',
  'common.amount': '金額',
  'common.category': 'カテゴリー',
  'common.account': '口座',
  'common.date': '日付',
  'common.description': '説明',
  'common.add': '追加',
  'common.total': '合計',
  'common.net': '純額',
  'common.monthly': '毎月',
  'common.none': 'なし',
  'dashboard.totalBalance': '総残高',
  'dashboard.monthlyIncome': '月収',
  'dashboard.monthlyExpenses': '月支出',
  'dashboard.netThisMonth': '今月の純額',
  'dashboard.recentTransactions': '最近の取引',
  'transactions.title': '取引',
  'transactions.new': '新規取引',
  'analytics.title': '分析',
  'cashflow.title': 'キャッシュフロー',
  'budgets.title': '予算',
  'budgets.new': '新しい予算',
  'accounts.title': '口座',
  'accounts.new': '新しい口座',
  'accounts.cash': '現金',
  'accounts.checking': '当座預金',
  'accounts.savings': '普通預金',
  'accounts.credit': 'クレジットカード',
  'accounts.investment': '投資',
  'settings.title': '設定',
  'settings.appearance': '外観',
  'settings.language': '言語',
  'settings.themeDark': 'ダーク',
  'settings.themeLight': 'ライト',
  'categories.Food': '食費',
  'categories.Transport': '交通費',
  'categories.Housing': '住居費',
  'categories.Health': '医療費',
  'categories.Entertainment': '娯楽',
  'categories.Salary': '給料',
  'categories.Investment': '投資',
  'categories.Other': 'その他',
};

function merge(base: Dict, partial: Partial<Dict>): Dict {
  return { ...base, ...partial };
}

export const TRANSLATIONS: Record<SupportedLanguage, Dict> = {
  'pt-BR': pt_BR,
  'en-US': en_US,
  es: merge(en_US, es),
  fr: merge(en_US, fr),
  de: merge(en_US, de),
  it: merge(en_US, it),
  zh: merge(en_US, zh),
  ja: merge(en_US, ja),
};

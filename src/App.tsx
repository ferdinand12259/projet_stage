import { useEffect, useMemo, useRef, useState } from 'react'
import {
  Activity, ArrowDownToLine, ArrowUpRight, Bell, CalendarDays, Check, CheckCircle2,
  ChevronDown, ChevronLeft, ChevronRight, CircleHelp, Cloud, Copy, FileArchive,
  FileImage, FileSpreadsheet, FileText, Filter, Folder, FolderOpen, HardDrive, LayoutDashboard,
  ListTodo, LogOut, Menu, MessageCircle, MessageSquare, Moon, MoreHorizontal, Plus, Search,
  Settings, ShieldCheck, Sun, Trash2, Upload, Users, Video, X, type LucideIcon,
} from 'lucide-react'

type Page = 'Tableau de bord' | 'Discussions' | 'Messagerie' | 'Documents & Stockage' | 'Agenda' | 'Réunions' | 'Tâches' | 'Équipe' | 'Paramètres'
type FileKind = 'PDF' | 'Word' | 'Excel' | 'Image' | 'Archive'
type FileRecord = { id: number; name: string; kind: FileKind; size: string; owner: string; updated: string; color: string; folder: string }
type Transfer = { id: number; name: string; size: string; progress: number; status: 'active' | 'complete' | 'cancelled' }

const navigation: { label: Page; icon: LucideIcon }[] = [
  { label: 'Tableau de bord', icon: LayoutDashboard },
  { label: 'Discussions', icon: MessageCircle },
  { label: 'Messagerie', icon: MessageSquare },
  { label: 'Documents & Stockage', icon: FolderOpen },
  { label: 'Agenda', icon: CalendarDays },
  { label: 'Réunions', icon: Video },
  { label: 'Tâches', icon: ListTodo },
  { label: 'Équipe', icon: Users },
  { label: 'Paramètres', icon: Settings },
]

const initialFiles: FileRecord[] = [
  { id: 1, name: 'Présentation stratégie Q4.pdf', kind: 'PDF', size: '2,4 Mo', owner: 'Sophie Martin', updated: 'Aujourd’hui, 10:42', color: 'rose', folder: 'Marketing' },
  { id: 2, name: 'Budget prévisionnel 2025.xlsx', kind: 'Excel', size: '840 Ko', owner: 'Thomas Bernard', updated: 'Aujourd’hui, 09:18', color: 'green', folder: 'Finance' },
  { id: 3, name: 'Brief identité visuelle.docx', kind: 'Word', size: '1,2 Mo', owner: 'Emma Laurent', updated: 'Hier, 16:35', color: 'blue', folder: 'Design' },
  { id: 4, name: 'Maquettes application.zip', kind: 'Archive', size: '18,6 Mo', owner: 'Lucas Petit', updated: 'Hier, 14:02', color: 'amber', folder: 'Design' },
  { id: 5, name: 'Photo équipe.jpg', kind: 'Image', size: '3,1 Mo', owner: 'Sophie Martin', updated: '21 oct. 2026', color: 'purple', folder: 'Équipe' },
  { id: 6, name: 'Compte-rendu réunion.pdf', kind: 'PDF', size: '560 Ko', owner: 'Thomas Bernard', updated: '20 oct. 2026', color: 'rose', folder: 'Projets' },
]

const iconForKind: Record<FileKind, LucideIcon> = { PDF: FileText, Word: FileText, Excel: FileSpreadsheet, Image: FileImage, Archive: FileArchive }

function App() {
  const [page, setPage] = useState<Page>('Tableau de bord')
  const [theme, setTheme] = useState<'light' | 'dark'>(() => (localStorage.getItem('uryoffice-theme') as 'light' | 'dark') || 'light')
  const [files, setFiles] = useState(initialFiles)
  const [transfers, setTransfers] = useState<Transfer[]>([
    { id: 11, name: 'Rapport annuel 2025.pdf', size: '8,2 Mo', progress: 100, status: 'complete' },
    { id: 12, name: 'Assets campagne.zip', size: '24,8 Mo', progress: 68, status: 'active' },
  ])
  const [search, setSearch] = useState('')
  const [fileFilter, setFileFilter] = useState('Tous les fichiers')
  const [transferPanelOpen, setTransferPanelOpen] = useState(true)
  const [notificationOpen, setNotificationOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    localStorage.setItem('uryoffice-theme', theme)
    document.documentElement.dataset.theme = theme
    window.dispatchEvent(new CustomEvent('uryoffice-theme-change', { detail: theme }))
  }, [theme])

  useEffect(() => {
    const updateTheme = (event: Event) => setTheme((event as CustomEvent<'light' | 'dark'>).detail)
    window.addEventListener('uryoffice-theme-change', updateTheme)
    return () => window.removeEventListener('uryoffice-theme-change', updateTheme)
  }, [])

  useEffect(() => {
    const timer = window.setInterval(() => {
      setTransfers((current) => current.map((item) => item.status === 'active'
        ? { ...item, progress: Math.min(100, item.progress + 3), status: item.progress + 3 >= 100 ? 'complete' : 'active' }
        : item))
    }, 1200)
    return () => window.clearInterval(timer)
  }, [])

  const filteredFiles = useMemo(() => files.filter((file) => {
    const matchesSearch = `${file.name} ${file.owner} ${file.folder}`.toLowerCase().includes(search.toLowerCase())
    const matchesFilter = fileFilter === 'Tous les fichiers' || file.kind === fileFilter
    return matchesSearch && matchesFilter
  }), [files, search, fileFilter])

  const startImport = (selected: FileList | null) => {
    if (!selected?.length) return
    const imported = Array.from(selected).map((file, index) => {
      const id = Date.now() + index
      const extension = file.name.split('.').pop()?.toLowerCase()
      const kind: FileKind = extension === 'pdf' ? 'PDF' : ['doc', 'docx'].includes(extension ?? '') ? 'Word' : ['xls', 'xlsx', 'csv'].includes(extension ?? '') ? 'Excel' : ['zip', 'rar'].includes(extension ?? '') ? 'Archive' : 'Image'
      const size = file.size > 1024 * 1024 ? `${(file.size / (1024 * 1024)).toFixed(1)} Mo` : `${Math.max(1, Math.round(file.size / 1024))} Ko`
      return { id, name: file.name, kind, size, owner: 'Vous', updated: 'À l’instant', color: kind === 'Excel' ? 'green' : kind === 'PDF' ? 'rose' : 'blue', folder: 'Mes fichiers' }
    })
    setFiles((current) => [...imported, ...current])
    setTransfers((current) => [...imported.map((file) => ({ id: file.id, name: file.name, size: file.size, progress: 0, status: 'active' as const })), ...current])
    setPage('Documents & Stockage')
  }

  const cancelTransfer = (transfer: Transfer) => {
    if (!window.confirm(`Annuler le transfert de « ${transfer.name} » ?`)) return
    setTransfers((current) => current.map((item) => item.id === transfer.id ? { ...item, status: 'cancelled' } : item))
    setFiles((current) => current.filter((file) => file.id !== transfer.id))
  }

  const removeTransfer = (transfer: Transfer) => {
    if (!window.confirm(`Retirer « ${transfer.name} » de l’historique ? Le fichier ne sera pas supprimé.`)) return
    setTransfers((current) => current.filter((item) => item.id !== transfer.id))
  }

  const removeFile = (file: FileRecord) => {
    if (!window.confirm(`Supprimer « ${file.name} » de la liste de démonstration ?`)) return
    setFiles((current) => current.filter((item) => item.id !== file.id))
  }

  const pageTitle = page
  const nav = (compact = false) => (
    <nav className={compact ? 'sidebar-nav mobile-sidebar-nav' : 'sidebar-nav'} aria-label="Navigation principale">
      <div className="nav-caption">ESPACE DE TRAVAIL</div>
      {navigation.map(({ label, icon: Icon }) => (
        <button key={label} className={`nav-item ${page === label ? 'active' : ''}`} onClick={() => { setPage(label); setMobileNavOpen(false) }}>
          <Icon size={18} strokeWidth={1.8} /><span>{label}</span>{label === 'Messagerie' && <span className="nav-badge">3</span>}
        </button>
      ))}
      <div className="storage-card">
        <div className="storage-heading"><Cloud size={16} /><span>Stockage utilisé</span></div>
        <div className="storage-value">68,4 Go <span>/ 100 Go</span></div>
        <div className="storage-track"><i /></div>
        <button onClick={() => setPage('Documents & Stockage')}>Gérer le stockage <ArrowUpRight size={13} /></button>
      </div>
    </nav>
  )

  return (
    <div className="app-shell" data-theme={theme}>
      <aside className="sidebar">
        <div className="brand"><div className="brand-mark"><Activity size={21} strokeWidth={2.5} /></div><span>ury<span className="brand-light">office</span></span></div>
        {nav()}
        <div className="sidebar-bottom">
          <button className="help-link"><CircleHelp size={17} /> Centre d’aide</button>
          <div className="sidebar-user"><div className="avatar avatar-small">ML</div><div><strong>Marie Laurent</strong><span>Administratrice</span></div><MoreHorizontal size={18} /></div>
        </div>
      </aside>

      {mobileNavOpen && <div className="mobile-overlay" onClick={() => setMobileNavOpen(false)}><aside className="mobile-sidebar" onClick={(event) => event.stopPropagation()}><div className="brand"><div className="brand-mark"><Activity size={21} /></div><span>ury<span className="brand-light">office</span></span><button className="icon-button close-mobile" onClick={() => setMobileNavOpen(false)} aria-label="Fermer le menu"><X size={20} /></button></div>{nav(true)}</aside></div>}

      <main className="main-area">
        <header className="topbar">
          <button className="icon-button mobile-menu" aria-label="Ouvrir le menu" onClick={() => setMobileNavOpen(true)}><Menu size={20} /></button>
          <div className="breadcrumbs"><span>Espace de travail</span><ChevronRight size={15} /><strong>{pageTitle}</strong></div>
          <div className="topbar-actions">
            <label className="top-search"><Search size={17} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Rechercher..." /><kbd>⌘ K</kbd></label>
            <div className="popover-wrap">
              <button className="icon-button notification-button" onClick={() => { setNotificationOpen(!notificationOpen); setProfileOpen(false) }} aria-label="Notifications"><Bell size={19} /><i /></button>
              {notificationOpen && <div className="popover notifications-popover"><div className="popover-title"><strong>Notifications</strong><button className="text-button" onClick={() => setNotificationOpen(false)}>Tout voir</button></div><p><span className="notice-dot blue-dot" /><span><b>Thomas Bernard</b> a partagé un document avec vous.<small>Il y a 12 min</small></span></p><p><span className="notice-dot purple-dot" /><span>Réunion « Point équipe » dans 30 minutes.<small>Il y a 28 min</small></span></p><p><span className="notice-dot green-dot" /><span>Votre espace de stockage est à jour.<small>Hier</small></span></p></div>}
            </div>
            <div className="popover-wrap">
              <button className="profile-button" onClick={() => { setProfileOpen(!profileOpen); setNotificationOpen(false) }}><div className="avatar">ML</div><span>Marie Laurent</span><ChevronDown size={15} /></button>
              {profileOpen && <div className="popover profile-popover"><div className="profile-popover-head"><div className="avatar">ML</div><span><b>Marie Laurent</b><small>marie@uryoffice.fr</small></span></div><button onClick={() => { setPage('Paramètres'); setProfileOpen(false) }}><Settings size={16} /> Paramètres</button><button><LogOut size={16} /> Déconnexion</button></div>}
            </div>
          </div>
        </header>

        <div className="content">
          {page === 'Tableau de bord' ? <Dashboard onNavigate={setPage} files={files} onDeleteFile={removeFile} /> : page === 'Documents & Stockage' ? (
            <Documents
              files={filteredFiles} query={search} setQuery={setSearch} filter={fileFilter} setFilter={setFileFilter}
              onImport={() => fileInputRef.current?.click()} onOpenTransfers={() => setTransferPanelOpen(!transferPanelOpen)}
              transfers={transfers} panelOpen={transferPanelOpen} onCancel={cancelTransfer} onRemove={removeTransfer} onDeleteFile={removeFile}
            />
          ) : <GenericPage page={page} onNavigate={setPage} />}
        </div>
      </main>
      <input ref={fileInputRef} type="file" multiple hidden onChange={(event) => { startImport(event.target.files); event.target.value = '' }} />
      <button className="theme-toggle" onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')} aria-label={theme === 'light' ? 'Activer le thème sombre' : 'Activer le thème clair'} title={theme === 'light' ? 'Thème sombre' : 'Thème clair'}>{theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}<span>{theme === 'light' ? 'Mode sombre' : 'Mode clair'}</span></button>
    </div>
  )
}

export default App

function PageHeading({ eyebrow, title, subtitle, children }: { eyebrow?: string; title: string; subtitle: string; children?: React.ReactNode }) {
  return <div className="page-heading"><div>{eyebrow && <div className="eyebrow">{eyebrow}</div>}<h1>{title}</h1><p>{subtitle}</p></div>{children && <div className="heading-actions">{children}</div>}</div>
}

function Dashboard({ onNavigate, files, onDeleteFile }: { onNavigate: (page: Page) => void; files: FileRecord[]; onDeleteFile: (file: FileRecord) => void }) {
  return <>
    <PageHeading eyebrow="JEUDI 22 OCTOBRE 2026" title="Bonjour Marie 👋" subtitle="Voici ce qui se passe dans votre espace de travail aujourd’hui.">
      <button className="button button-secondary" onClick={() => onNavigate('Agenda')}><CalendarDays size={16} /> Voir l’agenda</button>
      <button className="button button-primary" onClick={() => onNavigate('Documents & Stockage')}><Plus size={17} /> Nouveau</button>
    </PageHeading>
    <section className="stats-grid" aria-label="Statistiques">
      <StatCard icon={Folder} label="Fichiers stockés" value="1 248" detail="+12 cette semaine" tone="blue" trend="↑ 8,2 %" />
      <StatCard icon={Users} label="Membres actifs" value="24" detail="sur 28 membres" tone="purple" trend="↑ 2" />
      <StatCard icon={CalendarDays} label="Réunions cette semaine" value="8" detail="Prochaine dans 30 min" tone="orange" trend="3 aujourd’hui" />
      <StatCard icon={ListTodo} label="Tâches à terminer" value="12" detail="4 arrivent à échéance" tone="green" trend="− 3" />
    </section>
    <div className="dashboard-grid">
      <section className="panel recent-panel">
        <PanelHeading title="Fichiers récents" subtitle="Les dernières activités de votre espace" action="Tout voir" onAction={() => onNavigate('Documents & Stockage')} />
        <FileList files={files.slice(0, 4)} compact onDelete={onDeleteFile} />
      </section>
      <section className="panel meetings-panel">
        <PanelHeading title="Vos réunions" subtitle="Votre agenda du jour" action="Agenda" onAction={() => onNavigate('Agenda')} />
        <div className="meeting-list">
          <Meeting time="11:00" title="Point d’équipe — Produit" people="6 participants" tone="blue" active />
          <Meeting time="14:30" title="Revue design sprint" people="4 participants" tone="purple" />
          <Meeting time="16:00" title="Synchronisation marketing" people="8 participants" tone="green" />
        </div>
        <button className="meeting-join" onClick={() => onNavigate('Réunions')}><Video size={16} /> Rejoindre la réunion <ArrowUpRight size={15} /></button>
      </section>
    </div>
    <section className="panel activity-panel">
      <PanelHeading title="Activité récente" subtitle="Restez informé des nouveautés de votre équipe" action="Voir tout" onAction={() => onNavigate('Discussions')} />
      <div className="activity-list">
        <ActivityItem initials="TB" name="Thomas Bernard" action="a partagé un document" subject="Budget prévisionnel 2025.xlsx" time="Il y a 18 min" tone="green" />
        <ActivityItem initials="EL" name="Emma Laurent" action="a commenté dans" subject="# Projet refonte" time="Il y a 42 min" tone="purple" />
        <ActivityItem initials="LP" name="Lucas Petit" action="a terminé la tâche" subject="Valider les maquettes" time="Il y a 1 h" tone="orange" />
      </div>
    </section>
  </>
}

function StatCard({ icon: Icon, label, value, detail, tone, trend }: { icon: LucideIcon; label: string; value: string; detail: string; tone: string; trend: string }) {
  return <article className="stat-card"><div className={`stat-icon ${tone}`}><Icon size={19} /></div><div className="stat-trend">{trend}</div><span className="stat-label">{label}</span><strong className="stat-value">{value}</strong><span className="stat-detail">{detail}</span></article>
}

function PanelHeading({ title, subtitle, action, onAction }: { title: string; subtitle: string; action: string; onAction: () => void }) {
  return <div className="panel-heading"><div><h2>{title}</h2><p>{subtitle}</p></div><button className="text-button" onClick={onAction}>{action}<ArrowUpRight size={14} /></button></div>
}

function FileList({ files, compact = false, onDelete }: { files: FileRecord[]; compact?: boolean; onDelete?: (file: FileRecord) => void }) {
  if (!files.length) return <div className="empty-state"><FolderOpen size={28} /><span>Aucun fichier ne correspond à votre recherche.</span></div>
  return <div className={`file-list ${compact ? 'compact' : ''}`}>{files.map((file) => {
    const Icon = iconForKind[file.kind]
    return <div className="file-row" key={file.id}><div className={`file-icon ${file.color}`}><Icon size={18} /></div><div className="file-main"><strong>{file.name}</strong><span>{file.folder} · {file.size}</span></div><div className="file-owner"><div className="avatar avatar-tiny">{file.owner.split(' ').map((part) => part[0]).join('')}</div>{file.owner}</div><span className="file-updated">{file.updated}</span><FileActions file={file} onDelete={onDelete} /></div>
  })}</div>
}

function FileActions({ file, onDelete }: { file: FileRecord; onDelete?: (file: FileRecord) => void }) {
  const [open, setOpen] = useState(false)
  const [feedback, setFeedback] = useState('')
  const copyName = () => {
    if (!navigator.clipboard?.writeText) {
      setFeedback('Copie indisponible dans ce contexte.')
      return
    }
    void navigator.clipboard.writeText(file.name).then(() => {
      setFeedback('Nom copié.')
      setOpen(false)
    }, () => setFeedback('La copie a échoué.'))
  }

  return <div className="file-actions">
    <button className="icon-button row-more" aria-label={`Actions pour ${file.name}`} aria-expanded={open} onClick={() => setOpen(!open)}><MoreHorizontal size={18} /></button>
    {open && <div className="file-action-menu"><button onClick={copyName}><Copy size={14} /> Copier le nom</button>{onDelete && <button className="delete-file-action" onClick={() => { setOpen(false); onDelete(file) }}><Trash2 size={14} /> Supprimer de la liste</button>}</div>}
    {feedback && <span className="copy-feedback" role="status">{feedback}</span>}
  </div>
}

function Meeting({ time, title, people, tone, active = false }: { time: string; title: string; people: string; tone: string; active?: boolean }) {
  return <div className={`meeting ${active ? 'meeting-active' : ''}`}><div className={`meeting-timeline ${tone}`}><span>{time}</span><i /></div><div className="meeting-info"><strong>{title}</strong><span><Users size={13} /> {people}</span></div>{active && <span className="live-pill">En cours</span>}</div>
}

function ActivityItem({ initials, name, action, subject, time, tone }: { initials: string; name: string; action: string; subject: string; time: string; tone: string }) {
  return <div className="activity-item"><div className={`avatar activity-avatar ${tone}`}>{initials}</div><p><strong>{name}</strong> {action} <b>{subject}</b></p><span>{time}</span></div>
}

function Documents({ files, query, setQuery, filter, setFilter, onImport, onOpenTransfers, transfers, panelOpen, onCancel, onRemove, onDeleteFile }: {
  files: FileRecord[]; query: string; setQuery: (value: string) => void; filter: string; setFilter: (value: string) => void; onImport: () => void
  onOpenTransfers: () => void; transfers: Transfer[]; panelOpen: boolean; onCancel: (transfer: Transfer) => void; onRemove: (transfer: Transfer) => void
  onDeleteFile: (file: FileRecord) => void
}) {
  const [view, setView] = useState<'list' | 'grid'>('list')
  return <>
    <PageHeading eyebrow="VOTRE ESPACE" title="Documents & Stockage" subtitle="Retrouvez et gérez tous les fichiers de votre équipe.">
      <button className="button button-secondary" onClick={onOpenTransfers}><ArrowDownToLine size={16} /> Transferts <span className="button-count">{transfers.filter((item) => item.status === 'active').length}</span></button>
      <button className="button button-primary" onClick={onImport}><Upload size={16} /> Importer des fichiers</button>
    </PageHeading>
    <div className="demo-note documents-demo-note"><ShieldCheck size={15} /> Fichiers et transferts de démonstration : les importations sont simulées localement et aucun fichier n’est envoyé à un serveur.</div>
    <div className="storage-summary panel"><div className="storage-summary-icon"><HardDrive size={20} /></div><div className="storage-summary-copy"><strong>Votre espace de stockage</strong><span>68,4 Go utilisés sur 100 Go</span></div><div className="storage-summary-track"><div /></div><strong className="storage-percent">68%</strong><button className="text-button storage-manage">Gérer l’espace <ArrowUpRight size={14} /></button></div>
    <section className="panel documents-panel">
      <div className="documents-toolbar"><div className="documents-title"><h2>Tous les fichiers</h2><span className="file-count">{files.length}</span></div><div className="documents-controls">
        <label className="document-search"><Search size={16} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Rechercher un fichier..." /><button onClick={() => setQuery('')} aria-label="Effacer la recherche"><X size={14} /></button></label>
        <label className="filter-select"><Filter size={15} /><select value={filter} onChange={(event) => setFilter(event.target.value)}><option>Tous les fichiers</option><option>PDF</option><option>Word</option><option>Excel</option><option>Image</option><option>Archive</option></select><ChevronDown size={14} /></label>
        <div className="view-toggle"><button className={view === 'list' ? 'selected' : ''} onClick={() => setView('list')} aria-label="Vue en liste"><Menu size={16} /></button><button className={view === 'grid' ? 'selected' : ''} onClick={() => setView('grid')} aria-label="Vue en grille"><Folder size={16} /></button></div>
      </div></div>
      {view === 'list' ? <FileList files={files} onDelete={onDeleteFile} /> : <div className="file-grid">{files.map((file) => { const Icon = iconForKind[file.kind]; return <article className="grid-file" key={file.id}><div className={`file-icon ${file.color}`}><Icon size={20} /></div><FileActions file={file} onDelete={onDeleteFile} /><strong>{file.name}</strong><span>{file.folder} · {file.size}</span><small>{file.updated}</small></article> })}</div>}
      <div className="table-footer"><span>Affichage de <b>{files.length ? 1 : 0}–{files.length}</b> sur <b>{files.length}</b> fichiers</span><div><button className="pagination-button" disabled><ChevronLeft size={16} /></button><button className="pagination-current">1</button><button className="pagination-button" disabled><ChevronRight size={16} /></button></div></div>
    </section>
    {panelOpen && <TransferPanel transfers={transfers} onCancel={onCancel} onRemove={onRemove} onClose={onOpenTransfers} />}
  </>
}

function TransferPanel({ transfers, onCancel, onRemove, onClose }: { transfers: Transfer[]; onCancel: (transfer: Transfer) => void; onRemove: (transfer: Transfer) => void; onClose: () => void }) {
  return <aside className="transfer-panel" aria-label="Suivi des transferts"><div className="transfer-header"><div><h2>Transferts</h2><p>Suivi des importations récentes</p></div><button className="icon-button" aria-label="Fermer le panneau" onClick={onClose}><X size={18} /></button></div>
    {!transfers.length ? <div className="transfer-empty"><CheckCircle2 size={25} /><strong>Aucun transfert en cours</strong><span>Vos transferts apparaîtront ici.</span></div> : <div className="transfer-list">{transfers.map((transfer) => <div className="transfer-item" key={transfer.id}><div className="transfer-item-top"><div className="transfer-file-icon"><FileText size={17} /></div><div className="transfer-copy"><strong>{transfer.name}</strong><span>{transfer.size}</span></div><div className="transfer-menu">
      {transfer.status === 'active' ? <button className="transfer-action cancel-action" onClick={() => onCancel(transfer)} title="Annuler le transfert" aria-label={`Annuler le transfert de ${transfer.name}`}><X size={15} /></button>
        : transfer.status === 'complete' ? <><CheckCircle2 className="transfer-check" size={17} /><button className="transfer-action remove-action" onClick={() => onRemove(transfer)} title="Retirer de l’historique" aria-label={`Retirer ${transfer.name} de l’historique`}><Trash2 size={15} /></button></>
          : <><span className="cancelled-label">Annulé</span><button className="transfer-action remove-action" onClick={() => onRemove(transfer)} title="Retirer de l’historique" aria-label={`Retirer ${transfer.name} de l’historique`}><Trash2 size={15} /></button></>}
    </div></div>{transfer.status === 'active' ? <><div className="transfer-progress-track"><i style={{ width: `${transfer.progress}%` }} /></div><div className="transfer-progress-label"><span>{transfer.progress}%</span><span>Importation en cours</span></div></> : <div className={`transfer-status ${transfer.status}`}>{transfer.status === 'complete' ? 'Transfert terminé' : 'Transfert annulé'}{transfer.status === 'complete' && <span>{transfer.progress}%</span>}</div>}</div>)}</div>}
    <div className="transfer-note"><ShieldCheck size={15} /><span>Démo locale : ces transferts sont simulés dans l’interface et aucun fichier n’est envoyé à un serveur.</span></div>
  </aside>
}

function GenericPage({ page, onNavigate }: { page: Page; onNavigate: (page: Page) => void }) {
  const descriptions: Record<Page, string> = {
    'Tableau de bord': '', 'Discussions': 'Échangez avec votre équipe et suivez les conversations de vos projets.',
    'Messagerie': 'Retrouvez vos messages et restez en contact avec vos collaborateurs.',
    'Documents & Stockage': '', 'Agenda': 'Organisez votre journée et retrouvez les prochains rendez-vous de votre équipe.',
    'Réunions': 'Préparez vos réunions, invitez vos collègues et retrouvez les comptes-rendus.',
    'Tâches': 'Suivez l’avancement du travail et les échéances de votre équipe.',
    'Équipe': 'Retrouvez les membres de votre espace de travail et leurs activités.',
    'Paramètres': 'Personnalisez votre espace de travail et gérez vos préférences.',
  }
  const cards: Record<Page, { title: string; detail: string; icon: LucideIcon }[]> = {
    'Tableau de bord': [], 'Discussions': [{ title: '# général', detail: 'Les nouvelles de toute l’équipe', icon: MessageCircle }, { title: '# projet-refonte', detail: 'Échanges autour de la refonte', icon: MessageCircle }, { title: '# idées', detail: 'Partagez vos idées avec l’équipe', icon: MessageCircle }],
    'Messagerie': [{ title: 'Sophie Martin', detail: 'Tu as pu regarder la présentation ?', icon: MessageSquare }, { title: 'Thomas Bernard', detail: 'Le budget est prêt pour relecture.', icon: MessageSquare }, { title: 'Équipe Produit', detail: 'Merci à tous pour la réunion !', icon: MessageSquare }],
    'Documents & Stockage': [], 'Agenda': [{ title: 'Point d’équipe — Produit', detail: '11:00 · 6 participants', icon: CalendarDays }, { title: 'Revue design sprint', detail: '14:30 · 4 participants', icon: CalendarDays }, { title: 'Synchronisation marketing', detail: '16:00 · 8 participants', icon: CalendarDays }],
    'Réunions': [{ title: 'Point d’équipe — Produit', detail: 'Aujourd’hui à 11:00 · Salle virtuelle', icon: Video }, { title: 'Revue design sprint', detail: 'Aujourd’hui à 14:30 · Salle virtuelle', icon: Video }, { title: 'Planification sprint', detail: 'Demain à 09:30 · Salle virtuelle', icon: Video }],
    'Tâches': [{ title: 'Finaliser la présentation Q4', detail: 'Sophie Martin · Échéance aujourd’hui', icon: Check }, { title: 'Valider les maquettes', detail: 'Lucas Petit · Échéance demain', icon: Check }, { title: 'Préparer le brief campagne', detail: 'Emma Laurent · Cette semaine', icon: Check }],
    'Équipe': [{ title: 'Sophie Martin', detail: 'Marketing · En ligne', icon: Users }, { title: 'Thomas Bernard', detail: 'Finance · En ligne', icon: Users }, { title: 'Emma Laurent', detail: 'Design · Disponible', icon: Users }],
    'Paramètres': [{ title: 'Préférences générales', detail: 'Langue, thème et notifications', icon: Settings }, { title: 'Membres & permissions', detail: 'Gérez les accès de votre espace', icon: Users }, { title: 'Stockage', detail: '68,4 Go utilisés sur 100 Go', icon: HardDrive }],
  }
  return <><PageHeading eyebrow="ESPACE DE TRAVAIL" title={page} subtitle={descriptions[page]}>{page === 'Paramètres' && <ThemeControl />}</PageHeading>
    {page === 'Paramètres' && <section className="panel settings-theme-panel"><div className="settings-theme-icon"><Moon size={19} /></div><div><h2>Apparence</h2><p>Choisissez le thème de votre espace de travail. Votre préférence est enregistrée sur cet appareil.</p></div><ThemeControl /></section>}
    <section className="panel generic-panel"><PanelHeading title={page === 'Agenda' || page === 'Réunions' ? 'À venir' : page === 'Tâches' ? 'Mes tâches' : 'Récemment consulté'} subtitle={page === 'Équipe' ? 'Membres de votre espace' : 'Contenu de démonstration'} action="Documents" onAction={() => onNavigate('Documents & Stockage')} /><div className="generic-list">{cards[page].map(({ title, detail, icon: Icon }, index) => <article className="generic-row" key={title}><div className={`generic-icon tone-${index % 3}`}><Icon size={18} /></div><div><strong>{title}</strong><span>{detail}</span></div><button className="icon-button"><MoreHorizontal size={18} /></button></article>)}</div></section>
    <div className="demo-note"><ShieldCheck size={16} /> Cette section utilise des données de démonstration. Les fonctionnalités de collaboration seront connectées au backend ultérieurement.</div>
  </>
}

function ThemeControl() {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => (localStorage.getItem('uryoffice-theme') as 'light' | 'dark') || 'light')
  const toggle = () => {
    const next = theme === 'light' ? 'dark' : 'light'
    setTheme(next)
    localStorage.setItem('uryoffice-theme', next)
    document.documentElement.dataset.theme = next
    window.dispatchEvent(new CustomEvent('uryoffice-theme-change', { detail: next }))
  }
  useEffect(() => {
    const update = (event: Event) => setTheme((event as CustomEvent<'light' | 'dark'>).detail)
    window.addEventListener('uryoffice-theme-change', update)
    return () => window.removeEventListener('uryoffice-theme-change', update)
  }, [])
  return <button className="theme-control" onClick={toggle}>{theme === 'light' ? <Sun size={16} /> : <Moon size={16} />} Thème {theme === 'light' ? 'clair' : 'sombre'}<span className={`switch ${theme === 'dark' ? 'switch-on' : ''}`}><i /></span></button>
}

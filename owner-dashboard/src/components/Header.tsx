
interface HeaderProps {
  onRefresh?: () => void;
  isSyncing?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onRefresh, isSyncing }) => {
  return (
    <header className="dashboard-header">
      <div className="header-left">
        <div className="logo-badge">🪑</div>
        <div>
          <h1 className="header-title">BookMyChair</h1>
          <p className="header-subtitle">Owner Console • Glamour Lounge</p>
        </div>
      </div>
      <div className="header-right">
        <span className="live-indicator">
          <span className="pulsing-dot"></span> AI Agent Active
        </span>
        {onRefresh && (
          <button
            onClick={onRefresh}
            className="refresh-btn"
            disabled={isSyncing}
            title="Reload latest state"
          >
            {isSyncing ? 'Syncing...' : '↻ Refresh'}
          </button>
        )}
      </div>
    </header>
  );
};

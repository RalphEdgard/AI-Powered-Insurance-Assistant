import { useState } from 'react';
import Sidebar, { type Page } from './components/Sidebar';
import { Card, SectionLabel } from './components/ui';
import MemberChatPage from './pages/MemberChatPage';

function PlaceholderPage({ title, message }: { title: string; message: string }) {
  return (
    <div className="page-container">
      <header className="page-header">
        <div>
          <p className="eyebrow">Planned Feature</p>
          <h1>{title}</h1>
        </div>
      </header>
      <Card className="empty-panel">
        <SectionLabel>Coming Next</SectionLabel>
        <p>{message}</p>
      </Card>
    </div>
  );
}

export default function App() {
  const [page, setPage] = useState<Page>('chat');

  return (
    <div className="app-shell">
      <Sidebar current={page} onChange={setPage} />
      <main className="main-content">
        {page === 'chat' && <MemberChatPage />}
        {page === 'evaluations' && (
          <PlaceholderPage
            title="Evaluation Dashboard"
            message="This page will display retrieval accuracy, abstention tests and safety-routing results after the RAG stage is implemented."
          />
        )}
        {page === 'logs' && (
          <PlaceholderPage
            title="Audit Log"
            message="This page will show synthetic interaction events, selected providers, latency and escalation outcomes."
          />
        )}
        {page === 'knowledge' && (
          <PlaceholderPage
            title="Knowledge Base"
            message="This page will later display ingested synthetic plan documents, chunk metadata and versions."
          />
        )}
      </main>
    </div>
  );
}

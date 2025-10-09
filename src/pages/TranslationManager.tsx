import Header from '@/components/Header';
import TranslationManagerContent from '@/components/design-system/TranslationManagerContent';

export default function TranslationManager() {
  return (
    <div className="min-h-screen">
      <Header />
      
      <main className="py-section">
        <div className="container max-w-7xl px-4 sm:px-6 lg:px-8">
          <TranslationManagerContent />
        </div>
      </main>
    </div>
  );
}

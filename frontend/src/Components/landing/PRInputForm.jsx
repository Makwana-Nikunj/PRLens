import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import Button from '../ui/Button';
import Input from '../ui/Input';

export const isValidPR = (url) =>
  /^https:\/\/github\.com\/[^/]+\/[^/]+\/pull\/\d+/i.test(url.trim());

const Spinner = () => (
  <svg className="w-[18px] h-[18px] animate-spin-slow" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </svg>
);

const PRInputForm = ({ buttonLabel = 'Analyze PR' }) => {
  const inputRef = useRef(null);
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const handleAnalyze = () => {
    const url = inputRef.current?.value.trim();
    if (!url) {
      inputRef.current.focus();
      inputRef.current.placeholder = 'Please paste a PR URL first';
      setTimeout(() => {
        if (inputRef.current) inputRef.current.placeholder = 'https://github.com/owner/repo/pull/123';
      }, 2000);
      return;
    }
    if (!isValidPR(url)) {
      setError(true);
      setTimeout(() => setError(false), 1800);
      inputRef.current.select();
      return;
    }

    setLoading(true);
    sessionStorage.setItem('pending_pr_analyze', url);
    setTimeout(() => {
      navigate(isAuthenticated ? '/dashboard' : '/login');
    }, 600);
  };

  return (
    <div
      className="relative mx-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-0 rounded-xl p-[6px] transition max-w-[640px]"
      style={{ background: 'var(--prl-panel)', border: '1px solid var(--prl-border)' }}
    >
      <Input
        ref={inputRef}
        placeholder="https://github.com/owner/repo/pull/123"
        autoComplete="off"
        spellCheck={false}
        onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
        aria-label="GitHub Pull Request URL"
      />
      <Button
        variant={error ? 'danger' : 'primary'}
        onClick={handleAnalyze}
        disabled={loading}
        aria-label="Analyze Pull Request"
      >
        {loading ? (
          <>
            <Spinner />
            Analyzing...
          </>
        ) : error ? (
          'Invalid URL'
        ) : (
          buttonLabel
        )}
      </Button>
    </div>
  );
};

export default PRInputForm;

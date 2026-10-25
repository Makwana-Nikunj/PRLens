import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LoaderCircle } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import Button from '../ui/Button';
import Input from '../ui/Input';

export const isValidPR = (url) =>
  /^https:\/\/github\.com\/[^/]+\/[^/]+\/pull\/\d+/i.test(url.trim());

const PRInputForm = ({ buttonLabel = 'Analyze PR', id = 'pr-url' }) => {
  const inputRef = useRef(null);
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAnalyze = () => {
    const url = inputRef.current?.value.trim();
    if (!url) {
      setError('Paste a pull request URL first.');
      inputRef.current.focus();
      return;
    }
    if (!isValidPR(url)) {
      setError('That does not look like a GitHub pull request URL.');
      inputRef.current.select();
      return;
    }

    setError('');
    setLoading(true);
    sessionStorage.setItem('pending_pr_analyze', url);
    setTimeout(() => {
      navigate(isAuthenticated ? '/dashboard' : '/login');
    }, 600);
  };

  return (
    <div className="w-full">
      <label
        htmlFor={id}
        className="block font-sans text-[14px] font-semibold text-[var(--prl-text)] mb-2"
      >
        GitHub pull request URL
      </label>

      <div
        className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 rounded p-1.5 bg-[var(--prl-bg-soft)]"
      >
        <Input
          id={id}
          ref={inputRef}
          placeholder="https://github.com/owner/repo/pull/123"
          autoComplete="off"
          spellCheck={false}
          onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? `${id}-error` : undefined}
        />
        <Button
          variant={error ? 'danger' : 'primary'}
          onClick={handleAnalyze}
          disabled={loading}
          aria-label="Analyze Pull Request"
        >
          {loading ? (
            <>
              <LoaderCircle className="w-[18px] h-[18px] animate-spin-slow" aria-hidden="true" />
              Analyzing...
            </>
          ) : error ? (
            'Invalid URL'
          ) : (
            buttonLabel
          )}
        </Button>
      </div>

      <p
        id={`${id}-error`}
        role="status"
        className={`mt-2 min-h-[18px] text-[13px] text-[var(--prl-danger)] ${error ? 'opacity-100' : 'opacity-0'}`}
      >
        {error || ''}
      </p>
    </div>
  );
};

export default PRInputForm;

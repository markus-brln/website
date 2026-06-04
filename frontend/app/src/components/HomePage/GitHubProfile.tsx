// GitHubProfile.jsx

import React, { useEffect, useState } from 'react';

const GitHubProfile = ({ username }) => {
  const [profile, setProfile] = useState(null);
  const [repos, setRepos] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const userRes = await fetch(`https://api.github.com/users/${username}`);
        if (!userRes.ok) {
          throw new Error('Failed to fetch user profile');
        }
        const userData = await userRes.json();

        const reposRes = await fetch(`https://api.github.com/users/${username}/repos?sort=pushed&per_page=5`);
        if (!reposRes.ok) {
          throw new Error('Failed to fetch repositories');
        }
        const reposData = await reposRes.json();

        setProfile(userData);
        setRepos(reposData);
      } catch (err) {
        setError(err.message);
      }
    };

    fetchProfile();
  }, [username]);

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!profile) {
    return <div>Loading profile…</div>;
  }

  return (
    <div style={{ border: '2px solid #ddd', padding: '16px', maxWidth: '400px', fontFamily: 'Arial, sans-serif', borderColor: 'gray', borderRadius: '5px' }}>
      <a href={profile.html_url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', color: '#0366d6' }}>
        <img
          src={profile.avatar_url}
          alt={`${profile.login} avatar`}
          style={{ width: '80px', height: '80px', borderRadius: '50%' }}
        />
        <h2 style={{ margin: '12px 0 4px' }}>{profile.name || profile.login}</h2>
      </a>
      {profile.bio && <p style={{ margin: '4px 0' }}>{profile.bio}</p>}
      <p style={{ margin: '8px 0', fontSize: '0.9em', color: '#555' }}>
        <strong>{profile.followers}</strong> followers • <strong>{profile.public_repos}</strong> public repos
      </p>

      <h3 style={{ margin: '16px 0 8px', color: 'gray' }}>Recent repos</h3>
      <ul style={{ listStyle: 'none', paddingLeft: 0, margin: 0 }}>
        {repos.map(repo => (
          <li key={repo.id} style={{ marginBottom: '8px' }}>
            <a href={repo.html_url} target="_blank" rel="noopener noreferrer" style={{ color: '#0366d6' }}>
              {repo.name}
            </a>
            {repo.description && <p style={{ margin: '2px 0 0', fontSize: '0.85em', color: '#444' }}>{repo.description}</p>}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default GitHubProfile;

# 🤝 Contributing to CollabBoard

Thank you for your interest in contributing to CollabBoard! This document provides guidelines and information for contributors.

---

## 📋 Table of Contents

- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Coding Standards](#coding-standards)
- [Git Workflow](#git-workflow)
- [Testing Guidelines](#testing-guidelines)
- [Documentation](#documentation)
- [Issue Guidelines](#issue-guidelines)
- [Pull Request Process](#pull-request-process)
- [Code Review](#code-review)
- [Release Process](#release-process)

---

## Getting Started

### Before You Begin

1. **Fork the Repository**
   ```bash
   # Fork on GitHub, then clone your fork
   git clone https://github.com/YOUR_USERNAME/CollabBoard.git
   cd CollabBoard
   ```

2. **Set Up Remote**
   ```bash
   # Add the original repository as upstream
   git remote add upstream https://github.com/Bisrat-19/CollabBoard.git
   ```

3. **Create a Branch**
   ```bash
   # Create a new branch for your feature
   git checkout -b feature/your-feature-name
   ```

### Types of Contributions

We welcome various types of contributions:

- 🐛 **Bug Fixes** - Fix issues and improve stability
- ✨ **New Features** - Add new functionality
- 📚 **Documentation** - Improve docs and guides
- 🎨 **UI/UX Improvements** - Enhance user experience
- ⚡ **Performance** - Optimize speed and efficiency
- 🔒 **Security** - Improve security measures
- 🧪 **Tests** - Add or improve test coverage

---

## Development Setup

### Prerequisites

- **Node.js** 18+ 
- **npm** or **yarn**
- **Git**
- **MongoDB** (local or Atlas)
- **Code Editor** (VS Code recommended)

### Local Development

1. **Clone and Install**
   ```bash
   git clone https://github.com/YOUR_USERNAME/CollabBoard.git
   cd CollabBoard
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   
   # Create environment file
   cp .env.example .env
   # Edit .env with your configuration
   
   npm run dev
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   
   # Create environment file
   cp .env.example .env.local
   # Edit .env.local with your configuration
   
   npm run dev
   ```

4. **Database Setup**
   ```bash
   # Set up MongoDB Atlas or local MongoDB
   # Update MONGO_URI in backend/.env
   ```

### Development Tools

#### VS Code Extensions (Recommended)
```json
{
  "recommendations": [
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint",
    "bradlc.vscode-tailwindcss",
    "ms-vscode.vscode-typescript-next",
    "formulahendry.auto-rename-tag",
    "christian-kohler.path-intellisense"
  ]
}
```

#### Pre-commit Hooks
```bash
# Install husky for git hooks
npm install --save-dev husky lint-staged

# Configure in package.json
{
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged"
    }
  },
  "lint-staged": {
    "*.{js,jsx,ts,tsx}": [
      "eslint --fix",
      "prettier --write"
    ]
  }
}
```

---

## Coding Standards

### General Principles

- **Readability** - Write code that's easy to understand
- **Maintainability** - Structure code for long-term maintenance
- **Performance** - Consider efficiency in your implementations
- **Security** - Follow security best practices
- **Accessibility** - Ensure features are accessible to all users

### JavaScript/TypeScript

#### Naming Conventions
```typescript
// Variables and functions - camelCase
const userName = 'john';
const getUserData = () => {};

// Constants - UPPER_SNAKE_CASE
const API_BASE_URL = 'https://api.example.com';

// Classes and Components - PascalCase
class UserService {}
const UserProfile = () => {};

// Interfaces and Types - PascalCase
interface UserData {}
type UserStatus = 'active' | 'inactive';
```

#### Code Structure
```typescript
// Import order
import React from 'react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import type { User } from '@/types';

// Component structure
interface Props {
  userId: string;
  onUpdate?: (user: User) => void;
}

export const UserProfile: React.FC<Props> = ({ userId, onUpdate }) => {
  // Hooks first
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Event handlers
  const handleUpdate = async () => {
    // Implementation
  };

  // Effects
  useEffect(() => {
    // Implementation
  }, [userId]);

  // Render
  if (loading) return <div>Loading...</div>;
  
  return (
    <div>
      {/* JSX */}
    </div>
  );
};
```

#### Error Handling
```typescript
// Use try-catch for async operations
const fetchUser = async (id: string) => {
  try {
    const response = await api.get(`/users/${id}`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch user:', error);
    throw new Error('User not found');
  }
};

// Use error boundaries in React
class ErrorBoundary extends React.Component {
  // Implementation
}
```

### CSS/Styling

#### Tailwind CSS Guidelines
```jsx
// Use Tailwind utility classes
<div className="flex items-center justify-between p-4 bg-white rounded-lg shadow-md">
  <h2 className="text-xl font-semibold text-gray-900">Title</h2>
  <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
    Action
  </button>
</div>

// Extract common patterns to components
const Card = ({ children, className = '' }) => (
  <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
    {children}
  </div>
);
```

#### Custom CSS
```css
/* Use CSS modules or styled-components for complex styles */
.userProfile {
  @apply relative overflow-hidden;
}

.userProfile::before {
  content: '';
  @apply absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600;
  opacity: 0.1;
}
```

### Backend Code

#### Express.js Structure
```javascript
// Route structure
const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const { validateProject } = require('../middlewares/validation');

// GET /api/projects
router.get('/', auth, async (req, res) => {
  try {
    const projects = await Project.find({ owner: req.user.id });
    res.json({ success: true, data: projects });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/projects
router.post('/', [auth, validateProject], async (req, res) => {
  try {
    const project = new Project({
      ...req.body,
      owner: req.user.id
    });
    await project.save();
    res.status(201).json({ success: true, data: project });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

module.exports = router;
```

#### Database Models
```javascript
// Mongoose schema structure
const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Project name is required'],
    trim: true,
    maxlength: [100, 'Project name cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  members: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  status: {
    type: String,
    enum: ['active', 'archived'],
    default: 'active'
  }
}, {
  timestamps: true
});

// Indexes
projectSchema.index({ owner: 1 });
projectSchema.index({ members: 1 });

module.exports = mongoose.model('Project', projectSchema);
```

---

## Git Workflow

### Branch Naming

Use descriptive branch names with prefixes:

```bash
# Feature branches
git checkout -b feature/user-authentication
git checkout -b feature/real-time-chat

# Bug fix branches
git checkout -b fix/login-validation-error
git checkout -b fix/memory-leak-in-socket

# Documentation branches
git checkout -b docs/api-documentation
git checkout -b docs/deployment-guide

# Hotfix branches
git checkout -b hotfix/security-patch
```

### Commit Messages

Follow conventional commit format:

```bash
# Format: type(scope): description

# Examples:
feat(auth): add JWT token refresh functionality
fix(ui): resolve button alignment issue in mobile view
docs(api): update authentication endpoint documentation
style(components): format code according to prettier rules
refactor(backend): extract database connection logic
test(frontend): add unit tests for user profile component
chore(deps): update dependencies to latest versions
```

### Commit Types

- **feat** - New feature
- **fix** - Bug fix
- **docs** - Documentation changes
- **style** - Code style changes (formatting, etc.)
- **refactor** - Code refactoring
- **test** - Adding or updating tests
- **chore** - Maintenance tasks

---

## Testing Guidelines

### Frontend Testing

#### Unit Tests (Jest + React Testing Library)
```typescript
// components/UserProfile.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { UserProfile } from './UserProfile';

describe('UserProfile', () => {
  it('renders user information correctly', () => {
    const mockUser = {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com'
    };

    render(<UserProfile user={mockUser} />);
    
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
  });

  it('calls onUpdate when edit button is clicked', () => {
    const mockOnUpdate = jest.fn();
    const mockUser = { id: '1', name: 'John Doe' };

    render(<UserProfile user={mockUser} onUpdate={mockOnUpdate} />);
    
    fireEvent.click(screen.getByText('Edit'));
    expect(mockOnUpdate).toHaveBeenCalledWith(mockUser);
  });
});
```

#### Integration Tests
```typescript
// tests/integration/auth.test.ts
import { render, screen, waitFor } from '@testing-library/react';
import { AuthProvider } from '@/contexts/AuthContext';
import { LoginForm } from '@/components/auth/LoginForm';

describe('Authentication Flow', () => {
  it('successfully logs in user', async () => {
    render(
      <AuthProvider>
        <LoginForm />
      </AuthProvider>
    );

    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'test@example.com' }
    });
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'password123' }
    });
    fireEvent.click(screen.getByText('Login'));

    await waitFor(() => {
      expect(screen.getByText('Welcome back!')).toBeInTheDocument();
    });
  });
});
```

### Backend Testing

#### Unit Tests (Jest)
```javascript
// tests/controllers/projectController.test.js
const request = require('supertest');
const app = require('../../server');
const Project = require('../../models/Project');
const { generateToken } = require('../../utils/auth');

describe('Project Controller', () => {
  let token;
  let userId;

  beforeEach(async () => {
    // Setup test data
    userId = new mongoose.Types.ObjectId();
    token = generateToken({ id: userId });
  });

  describe('GET /api/projects', () => {
    it('returns user projects', async () => {
      const project = await Project.create({
        name: 'Test Project',
        owner: userId
      });

      const response = await request(app)
        .get('/api/projects')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].name).toBe('Test Project');
    });
  });
});
```

#### API Tests
```javascript
// tests/api/projects.test.js
const request = require('supertest');
const app = require('../../server');

describe('Projects API', () => {
  it('creates a new project', async () => {
    const projectData = {
      name: 'New Project',
      description: 'Project description'
    };

    const response = await request(app)
      .post('/api/projects')
      .send(projectData)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(201);
    expect(response.body.data.name).toBe(projectData.name);
  });
});
```

### Test Coverage

Aim for high test coverage:

```bash
# Run tests with coverage
npm run test:coverage

# Coverage targets
# - Statements: 80%
# - Branches: 80%
# - Functions: 80%
# - Lines: 80%
```

---

## Documentation

### Code Documentation

#### JSDoc Comments
```typescript
/**
 * Fetches user data from the API
 * @param {string} userId - The unique identifier of the user
 * @param {boolean} includeProfile - Whether to include profile data
 * @returns {Promise<User>} Promise that resolves to user data
 * @throws {Error} When user is not found or API fails
 */
const fetchUser = async (userId: string, includeProfile = false): Promise<User> => {
  // Implementation
};
```

#### Component Documentation
```typescript
/**
 * UserProfile component displays user information and allows editing
 * 
 * @example
 * ```tsx
 * <UserProfile 
 *   userId="123" 
 *   onUpdate={(user) => console.log('Updated:', user)} 
 * />
 * ```
 */
interface UserProfileProps {
  /** Unique identifier of the user */
  userId: string;
  /** Callback function called when user data is updated */
  onUpdate?: (user: User) => void;
  /** Whether to show edit controls */
  editable?: boolean;
}
```

### README Updates

When adding new features, update relevant documentation:

- **README.md** - High-level project overview
- **docs/API.md** - API documentation
- **docs/DEPLOYMENT.md** - Deployment instructions
- **docs/CONTRIBUTING.md** - This file

---

## Issue Guidelines

### Creating Issues

Use the issue templates and provide:

1. **Clear Description** - What's the problem or feature request?
2. **Steps to Reproduce** - For bugs, provide detailed steps
3. **Expected vs Actual Behavior** - What should happen vs what happens
4. **Environment Information** - OS, browser, Node.js version
5. **Screenshots/Logs** - Visual evidence when helpful

### Issue Labels

- `bug` - Something isn't working
- `enhancement` - New feature or request
- `documentation` - Improvements or additions to documentation
- `good first issue` - Good for newcomers
- `help wanted` - Extra attention is needed
- `priority: high` - Urgent issues
- `priority: low` - Non-urgent issues

---

## Pull Request Process

### Before Submitting

1. **Update Documentation**
   ```bash
   # Update README if needed
   # Add API documentation for new endpoints
   # Update deployment guide if configuration changes
   ```

2. **Add Tests**
   ```bash
   # Write unit tests for new functionality
   # Add integration tests for API changes
   # Ensure all tests pass
   npm test
   ```

3. **Check Code Quality**
   ```bash
   # Run linter
   npm run lint
   
   # Run type checker (TypeScript)
   npm run type-check
   
   # Format code
   npm run format
   ```

### PR Description Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] Manual testing completed

## Screenshots
Add screenshots if UI changes

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] Tests added/updated
- [ ] No console errors
```

### PR Review Process

1. **Automated Checks**
   - CI/CD pipeline runs tests
   - Code coverage is checked
   - Linting and formatting verified

2. **Manual Review**
   - At least one maintainer reviews
   - Code quality assessment
   - Security review for sensitive changes

3. **Approval Process**
   - Address review comments
   - Make requested changes
   - Get approval from maintainers

---

## Code Review

### Review Guidelines

#### What to Look For

- **Functionality** - Does the code work as intended?
- **Performance** - Are there performance implications?
- **Security** - Are there security vulnerabilities?
- **Maintainability** - Is the code easy to maintain?
- **Testing** - Are there adequate tests?
- **Documentation** - Is the code well-documented?

#### Review Comments

Be constructive and specific:

```markdown
# Good comment
Consider using a more descriptive variable name here. 
`userData` could be `userProfile` to be more specific.

# Bad comment
This is wrong.
```

#### Review Checklist

- [ ] Code follows project conventions
- [ ] No obvious bugs or issues
- [ ] Error handling is appropriate
- [ ] Performance considerations addressed
- [ ] Security implications considered
- [ ] Tests are comprehensive
- [ ] Documentation is updated

---

## Release Process

### Version Management

We use semantic versioning (SemVer):

- **MAJOR** - Breaking changes
- **MINOR** - New features (backward compatible)
- **PATCH** - Bug fixes (backward compatible)

### Release Steps

1. **Prepare Release**
   ```bash
   # Update version in package.json
   npm version patch|minor|major
   
   # Update CHANGELOG.md
   # Tag the release
   git tag v1.0.0
   ```

2. **Deploy**
   ```bash
   # Deploy to staging
   # Run integration tests
   # Deploy to production
   ```

3. **Announce**
   - Create GitHub release
   - Update documentation
   - Notify users of breaking changes

---

## Getting Help

### Resources

- **Documentation** - Check existing docs first
- **Issues** - Search existing issues
- **Discussions** - Ask questions in GitHub Discussions
- **Discord/Slack** - Join our community channels

### Contact

- **Maintainers** - @Bisrat-19
- **Email** - support@collabboard.com
- **Discord** - [Join our server](https://discord.gg/collabboard)

---

## Recognition

Contributors are recognized in:

- **README.md** - Contributors section
- **GitHub** - Contributors graph
- **Releases** - Release notes
- **Documentation** - Credit where appropriate

---

**Thank you for contributing to CollabBoard! 🚀** 

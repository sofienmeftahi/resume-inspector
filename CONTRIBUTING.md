# Contributing to Resume Inspector

Thank you for your interest in contributing to Resume Inspector! This document provides guidelines and information for contributors.

## 🤝 How to Contribute

### 1. Fork the Repository
- Click the "Fork" button on the GitHub repository page
- Clone your forked repository to your local machine

### 2. Create a Feature Branch
```bash
git checkout -b feature/your-feature-name
```

### 3. Make Your Changes
- Follow the coding standards below
- Add tests for new features
- Update documentation as needed

### 4. Commit Your Changes
```bash
git add .
git commit -m "feat: add new feature description"
```

### 5. Push and Create Pull Request
```bash
git push origin feature/your-feature-name
```
Then create a Pull Request on GitHub.

## 📋 Coding Standards

### Python (Backend)
- Follow **PEP 8** style guide
- Use type hints where appropriate
- Add docstrings to functions and classes
- Keep functions focused and small

### JavaScript/React (Frontend)
- Use **ESLint** configuration
- Follow React best practices
- Use functional components with hooks
- Keep components focused and reusable

### Git Commit Messages
Use conventional commit format:
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes
- `refactor:` - Code refactoring
- `test:` - Adding tests
- `chore:` - Maintenance tasks

## 🧪 Testing

### Backend Testing
```bash
cd resume_inspector/backend
python -m pytest tests/
```

### Frontend Testing
```bash
cd resume_inspector/frontend
npm test
```

## 📝 Documentation

- Update README.md for new features
- Add API documentation for new endpoints
- Include usage examples
- Update installation instructions if needed

## 🐛 Bug Reports

When reporting bugs, please include:
- Clear description of the issue
- Steps to reproduce
- Expected vs actual behavior
- Environment details (OS, browser, etc.)
- Screenshots if applicable

## 💡 Feature Requests

When suggesting features:
- Describe the use case
- Explain the benefits
- Provide examples if possible
- Consider implementation complexity

## 🔧 Development Setup

### Prerequisites
- Python 3.8+
- Node.js 16+
- Git

### Quick Start
```bash
# Clone repository
git clone https://github.com/yourusername/resume-inspector.git
cd resume-inspector

# Backend setup
cd resume_inspector/backend
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install -r requirements.txt

# Frontend setup
cd ../frontend
npm install
```

## 📞 Getting Help

- Create an issue on GitHub
- Check existing issues and discussions
- Join our community discussions

## 🎯 Areas for Contribution

### High Priority
- Bug fixes
- Performance improvements
- Security enhancements
- Documentation improvements

### Medium Priority
- New skill categories
- Additional language support
- UI/UX improvements
- Test coverage

### Low Priority
- New features
- Experimental integrations
- Code refactoring

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to Resume Inspector! 🚀 
# 🛠️ Linting Guide for Booksan Backend

This guide provides comprehensive solutions for handling linting issues across the entire project.

## 🎯 **Quick Solutions**

### **1. Fix All Linting Issues at Once**
```bash
# Run the comprehensive lint fix script
pnpm run lint:fix

# Or run individual commands
pnpm run lint:check  # Check for issues
pnpm run lint        # Fix auto-fixable issues
pnpm run format      # Format with Prettier
```

### **2. Fix Specific File**
```bash
# Fix a specific file
npx eslint src/path/to/file.ts --fix
npx prettier --write src/path/to/file.ts
```

## 🔧 **Common Linting Issues & Solutions**

### **Issue 1: `any` Types**
**Problem**: `Unsafe assignment of an 'any' value`

**Solution**: Replace with proper types
```typescript
// ❌ Bad
const value = configService.get('KEY'); // any type

// ✅ Good
const value = configService.get<string>('KEY'); // string type
const value = configService.get<number>('PORT'); // number type
```

### **Issue 2: Unsafe Member Access**
**Problem**: `Unsafe member access .property on an 'any' value`

**Solution**: Type the response objects
```typescript
// ❌ Bad
const response = await fetch('/api');
const data = await response.json();
const name = data.name; // unsafe

// ✅ Good
interface ApiResponse {
  name: string;
  email: string;
}
const response = await fetch('/api');
const data = (await response.json()) as ApiResponse;
const name = data.name; // safe
```

### **Issue 3: ConfigService Type Safety**
**Problem**: ConfigService.get() returns `any`

**Solution**: Use generic types
```typescript
// ❌ Bad
const dbUrl = this.configService.get('DATABASE_URL');

// ✅ Good
const dbUrl = this.configService.get<string>('DATABASE_URL');
const port = this.configService.get<number>('PORT');
const isDev = this.configService.get<boolean>('NODE_ENV') === 'development';
```

### **Issue 4: API Response Typing**
**Problem**: Fetch responses are untyped

**Solution**: Define response interfaces
```typescript
// Define interfaces
interface UserResponse {
  id: string;
  name: string;
  email: string;
}

interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

// Use them
const response = await fetch('/api/users');
const users = (await response.json()) as UserResponse[];
```

## 🚀 **Project-Wide Solutions**

### **1. ESLint Configuration**
The project uses strict TypeScript ESLint rules:
- `@typescript-eslint/no-explicit-any: 'error'` - No `any` types allowed
- `@typescript-eslint/no-unsafe-assignment: 'error'` - No unsafe assignments
- `@typescript-eslint/no-unsafe-member-access: 'error'` - No unsafe member access

### **2. Prettier Configuration**
Consistent code formatting:
- Single quotes
- Trailing commas
- 2-space indentation
- 80 character line width

### **3. TypeScript Configuration**
Strict type checking enabled in `tsconfig.json`:
```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true
  }
}
```

## 📋 **Step-by-Step Fix Process**

### **Step 1: Identify Issues**
```bash
# Check all linting issues
pnpm run lint:check
```

### **Step 2: Auto-Fix Issues**
```bash
# Fix auto-fixable issues
pnpm run lint
```

### **Step 3: Manual Fixes**
For issues that can't be auto-fixed:

1. **Replace `any` with proper types**
2. **Add type assertions for API responses**
3. **Define interfaces for complex objects**
4. **Use generic types for ConfigService**

### **Step 4: Format Code**
```bash
# Format with Prettier
pnpm run format
```

### **Step 5: Verify Fixes**
```bash
# Check if all issues are resolved
pnpm run lint:check
pnpm run build
```

## 🎨 **Code Examples**

### **Before (With Issues)**
```typescript
@Injectable()
export class ExampleService {
  constructor(private configService: ConfigService) {}

  async getData() {
    const apiUrl = this.configService.get('API_URL'); // any type
    const response = await fetch(apiUrl);
    const data = await response.json(); // any type
    return data.users[0].name; // unsafe access
  }
}
```

### **After (Fixed)**
```typescript
interface ApiResponse {
  users: Array<{
    name: string;
    email: string;
  }>;
}

@Injectable()
export class ExampleService {
  constructor(private configService: ConfigService) {}

  async getData(): Promise<string> {
    const apiUrl = this.configService.get<string>('API_URL');
    const response = await fetch(apiUrl);
    const data = (await response.json()) as ApiResponse;
    return data.users[0].name;
  }
}
```

## 🔄 **Automated Workflow**

### **Pre-commit Hook** (Optional)
```bash
# Install husky for git hooks
pnpm add -D husky lint-staged

# Add to package.json
"lint-staged": {
  "*.ts": ["eslint --fix", "prettier --write"]
}
```

### **CI/CD Integration**
```yaml
# .github/workflows/lint.yml
name: Lint
on: [push, pull_request]
jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: pnpm install
      - run: pnpm run lint:check
      - run: pnpm run build
```

## 🛡️ **Best Practices**

### **1. Always Type ConfigService**
```typescript
// ✅ Good
const dbUrl = this.configService.get<string>('DATABASE_URL');
const port = this.configService.get<number>('PORT') || 3000;
```

### **2. Type API Responses**
```typescript
// ✅ Good
interface UserProfile {
  id: string;
  name: string;
  email: string;
}

const response = await fetch('/api/user');
const user = (await response.json()) as UserProfile;
```

### **3. Use Type Guards**
```typescript
// ✅ Good
function isUser(obj: unknown): obj is UserProfile {
  return typeof obj === 'object' && obj !== null && 'id' in obj;
}

const data = await response.json();
if (isUser(data)) {
  // data is now typed as UserProfile
  console.log(data.name);
}
```

### **4. Define Interfaces for Complex Objects**
```typescript
// ✅ Good
interface OAuthTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
}

interface OAuthProfileResponse {
  id: string;
  email: string;
  name: string;
  picture?: string;
}
```

## 🚨 **Emergency Fixes**

### **Quick Fix for Multiple Files**
```bash
# Fix all TypeScript files at once
find src -name "*.ts" -exec npx eslint {} --fix \;
find src -name "*.ts" -exec npx prettier --write {} \;
```

### **Disable Rules Temporarily** (Not Recommended)
```typescript
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const data: any = await response.json();
```

## 📊 **Monitoring**

### **Check Linting Status**
```bash
# Count linting issues
pnpm run lint:check 2>&1 | grep -c "error"

# Check specific file
npx eslint src/path/to/file.ts --format=json
```

### **Build Verification**
```bash
# Ensure build passes after fixes
pnpm run build
```

## 🎯 **Summary**

1. **Use `pnpm run lint:fix`** for comprehensive fixes
2. **Replace `any` with proper types** using generics
3. **Type API responses** with interfaces
4. **Use ConfigService generics** for type safety
5. **Run `pnpm run build`** to verify fixes
6. **Follow the examples** in this guide for consistent patterns

This approach ensures type safety, code quality, and maintainability across the entire project! 🚀

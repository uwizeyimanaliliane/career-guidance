@echo off
echo Setting up CGMIS database...
echo.

:: Install dependencies if not already installed
echo Installing dependencies...
npm install

:: Run database setup
echo.
echo Creating database and seeding users...
node src/seeds/setupDatabase.js

echo.
echo ========================================
echo Setup complete! 
echo.
echo You can now log in with:
echo Admin: admin@cgmis.local / admin123
echo Staff: staff@cgmis.local / staff123
echo ========================================
echo.

pause

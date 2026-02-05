# חיבור חשבון Git ל-GitHub (mikodem-991)

## מה מוגדר

- **Repository:** https://github.com/miko718/mikodem-991
- **Remote:** `origin` → `https://github.com/miko718/mikodem-991.git`

## התחברות ל-GitHub (לפני push)

GitHub לא מאפשר יותר סיסמה ב־HTTPS. צריך **Personal Access Token (PAT)**:

1. ב-GitHub: **Settings** → **Developer settings** → **Personal access tokens** → **Tokens (classic)**  
   או: https://github.com/settings/tokens

2. **Generate new token (classic)**  
   - תתן שם (למשל "mikodem-991")  
   - סמן scope: **repo**  
   - **Generate token** והעתק את ה־token (מוצג פעם אחת).

3. כשאתה מריץ **push** בטרמינל:
   - **Username:** `miko718` (או שם המשתמש שלך ב-GitHub)  
   - **Password:** הדבק את ה־**token** (לא את סיסמת החשבון).

### אופציה: GitHub CLI (פשוט יותר)

```bash
winget install GitHub.cli
gh auth login
```

בחר: GitHub.com → HTTPS → Login with browser. אחרי ההתחברות, `git push` יעבוד בלי להזין token כל פעם.

## פקודות שימושיות

```bash
cd c:\Users\user\Downloads\mikodem-app

# בדיקת סטטוס
git status

# הוספת כל השינויים
git add .

# commit
git commit -m "תיאור השינוי"

# שליחה ל-GitHub (אחרי ההתחברות למעלה)
git push -u origin main
```

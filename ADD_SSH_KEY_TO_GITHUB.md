# 🔑 Add SSH Key to GitHub - Quick Steps

## Your SSH Public Key (Copy This):

```
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIIJCNF8+TrrssILX8whH1qy2dpUnCYpRltrDbnrHcUnk apdas400@gmail.com
```

---

## 📋 Steps to Add Key to GitHub:

### Step 1: Copy the Key Above
Select and copy the entire key (starts with `ssh-ed25519`)

### Step 2: Go to GitHub Settings
Open in browser: **https://github.com/settings/keys**

### Step 3: Add New SSH Key
1. Click **"New SSH key"** button (green button on the right)
2. **Title**: `BharatPrint Development` (or any name you prefer)
3. **Key type**: Leave as `Authentication Key`
4. **Key**: Paste the key you copied above
5. Click **"Add SSH key"**

### Step 4: Verify Setup
Come back to terminal and run:
```bash
ssh -T git@github.com
```

**Expected output**: 
```
Hi arjunpratapdas! You've successfully authenticated, but GitHub does not provide shell access.
```

### Step 5: Push Your Code
```bash
cd /home/arjun/Downloads/BHARATPRINTmain2
git push origin main
```

---

## ✅ Done!

After adding the key, you'll be able to push without entering passwords!


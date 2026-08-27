import {
  UserAccount,
  CryptoPaymentRequest,
  OFFICIAL_USDT_TRC20_ADDRESS,
  ADMIN_EMAIL,
  SubscriptionPlan,
  AccountStatus,
  isAdminEmail,
  CardDetails,
} from '../types';
import { db, collection, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc, onSnapshot } from '../lib/firebase';

declare const chrome: any;

const USERS_STORAGE_KEY = 'iqbot_users_v1';
const PAYMENTS_STORAGE_KEY = 'iqbot_payments_v1';
const CURRENT_USER_STORAGE_KEY = 'iqbot_current_user_v1';

export function getCanonicalUID(email: string, existingId?: string): string {
  if (existingId && existingId.startsWith('usr_')) {
    return existingId;
  }
  const clean = (email || '').trim().toLowerCase();
  return 'usr_' + clean.replace(/[^a-zA-Z0-9]/g, '_');
}

// Initial seed data with explicit global UIDs
const INITIAL_USERS: UserAccount[] = [
  {
    id: 'usr_trade_vip_gmail_com',
    uid: 'usr_trade_vip_gmail_com',
    email: 'trade.vip@gmail.com',
    role: 'USER',
    status: 'ACTIVE',
    approved: true,
    active: true,
    password: 'vip12345',
    plan: 'LIFETIME',
    createdAt: new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString(),
    expiresAt: '2099-12-31T23:59:59.000Z',
    notes: 'Default Active VIP Trader Account (Instant Extension Direct Access)',
    balance: 2500.00,
    demoBalance: 10000.00,
    accountType: 'REAL',
  },
  {
    id: 'usr_somfxstore_gmail_com',
    uid: 'usr_somfxstore_gmail_com',
    email: ADMIN_EMAIL,
    role: 'ADMIN',
    status: 'ACTIVE',
    approved: true,
    active: true,
    password: 'admin12345',
    plan: 'LIFETIME',
    createdAt: new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString(),
    expiresAt: '2099-12-31T23:59:59.000Z',
    notes: 'Super Admin Account (somfxstore)',
    balance: 10000.00,
    demoBalance: 10000.00,
    accountType: 'REAL',
  },
  {
    id: 'usr_hamze_zakarie_gmail_com',
    uid: 'usr_hamze_zakarie_gmail_com',
    email: 'hamze.zakarie@gmail.com',
    role: 'ADMIN',
    status: 'ACTIVE',
    approved: true,
    active: true,
    password: 'admin12345',
    plan: 'LIFETIME',
    createdAt: new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString(),
    expiresAt: '2099-12-31T23:59:59.000Z',
    notes: 'Super Admin Account (hamze)',
    balance: 5420.50,
    demoBalance: 10000.00,
    accountType: 'REAL',
  },
  {
    id: 'usr_trader_vip_gmail_com',
    uid: 'usr_trader_vip_gmail_com',
    email: 'trader.vip@gmail.com',
    role: 'USER',
    status: 'ACTIVE',
    approved: true,
    active: true,
    password: 'trader12345',
    plan: 'MONTHLY_3',
    createdAt: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(),
    expiresAt: new Date(Date.now() + 85 * 24 * 3600 * 1000).toISOString(),
    txid: 'f8d92a11029c3847291048572019485720194857201948572019485720194857',
    paymentAmountUSDT: 35,
    paymentDate: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(),
    notes: 'Paid 3 Months USDT TRC20',
    balance: 1850.00,
    demoBalance: 10000.00,
    accountType: 'REAL',
  },
  {
    id: 'usr_somali_trader_gmail_com',
    uid: 'usr_somali_trader_gmail_com',
    email: 'somali.trader@gmail.com',
    role: 'USER',
    status: 'ACTIVE',
    approved: true,
    active: true,
    password: 'user12345',
    plan: 'MONTHLY_1',
    createdAt: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString(),
    expiresAt: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString(),
    txid: 'TQo9w2uULWo1y4EB934h4CWwRDEjLftGCg_tx982734',
    paymentAmountUSDT: 50,
    paymentDate: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString(),
    notes: 'Active Trader account ($50 USDT TRC20)',
    balance: 500.00,
    demoBalance: 10000.00,
    accountType: 'DEMO',
  },
];

const INITIAL_PAYMENTS: CryptoPaymentRequest[] = [
  {
    id: 'pay-001',
    userId: 'usr_somali_trader_gmail_com',
    userEmail: 'somali.trader@gmail.com',
    amountUSDT: 50,
    plan: 'MONTHLY_1',
    network: 'USDT_TRC20',
    walletAddress: OFFICIAL_USDT_TRC20_ADDRESS,
    txid: 'a90e3810f29c3847291048572019485720194857201948572019485720194857',
    status: 'APPROVED',
    submittedAt: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
    approvedAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
  },
  {
    id: 'pay-002',
    userId: 'usr_trader_vip_gmail_com',
    userEmail: 'trader.vip@gmail.com',
    amountUSDT: 35,
    plan: 'MONTHLY_3',
    network: 'USDT_TRC20',
    walletAddress: OFFICIAL_USDT_TRC20_ADDRESS,
    txid: 'f8d92a11029c3847291048572019485720194857201948572019485720194857',
    status: 'APPROVED',
    submittedAt: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(),
    approvedAt: new Date(Date.now() - 5 * 24 * 3600 * 1000 + 1000).toISOString(),
  },
];

class AuthService {
  private users: UserAccount[] = [];
  private payments: CryptoPaymentRequest[] = [];
  private currentUser: UserAccount | null = null;

  constructor() {
    this.loadStorage();
    this.initFirestoreSync();
    this.forceSyncFromFirestore();
  }

  public async forceSyncFromFirestore(): Promise<UserAccount[]> {
    try {
      // 1. Fetch from server backend API for resilience
      try {
        const restResp = await fetch('/api/auth/users');
        if (restResp.ok) {
          const restData = await restResp.json();
          if (restData.success && Array.isArray(restData.users) && restData.users.length > 0) {
            const userMap = new Map<string, UserAccount>();
            this.users.forEach(u => userMap.set(u.id, u));

            restData.users.forEach((item: any) => {
              const email = (item.email || '').trim().toLowerCase();
              if (!email) return;
              const isUserAdmin = item.role?.toUpperCase() === 'ADMIN' || isAdminEmail(email);
              const rawStatus = (item.status || '').toUpperCase();
              const isApproved = isUserAdmin || item.approved === true || rawStatus === 'ACTIVE' || rawStatus === 'APPROVED';
              const isActive = isUserAdmin || item.active === true || rawStatus === 'ACTIVE' || rawStatus === 'APPROVED';
              const computedStatus: AccountStatus =
                isApproved || isActive ? 'ACTIVE' :
                rawStatus === 'PENDING' ? 'PENDING' :
                rawStatus === 'SUSPENDED' ? 'SUSPENDED' :
                rawStatus === 'REJECTED' ? 'REJECTED' :
                isUserAdmin ? 'ACTIVE' : 'PENDING';

              const uid = item.uid || item.id || getCanonicalUID(email);

              const userObj: UserAccount = {
                id: uid,
                uid: uid,
                email,
                name: item.name || undefined,
                role: isUserAdmin ? 'ADMIN' : 'USER',
                status: computedStatus,
                approved: isApproved,
                active: isActive,
                password: item.password || '123456',
                plan: (item.plan as SubscriptionPlan) || 'LIFETIME',
                createdAt: item.createdAt || new Date().toISOString(),
                expiresAt: item.expiresAt || '2099-12-31T23:59:59.000Z',
                balance: typeof item.balance === 'number' ? item.balance : 1000,
                demoBalance: typeof item.demoBalance === 'number' ? item.demoBalance : 10000,
                accountType: 'REAL'
              };
              userMap.set(userObj.id, userObj);
              userMap.set(userObj.email.toLowerCase(), userObj);
            });

            const uniqueById = new Map<string, UserAccount>();
            userMap.forEach(u => uniqueById.set(u.id, u));
            this.users = Array.from(uniqueById.values());
            this.saveUsers();
          }
        }
      } catch (restErr) {
        // Fall back to direct Firestore SDK
      }

      // 2. Direct Firestore SDK fetch
      const [userSnap, paySnap] = await Promise.allSettled([
        getDocs(collection(db, 'users')),
        getDocs(collection(db, 'payments'))
      ]);

      if (userSnap.status === 'fulfilled' && !userSnap.value.empty) {
        const userMap = new Map<string, UserAccount>();
        this.users.forEach(u => userMap.set(u.id, u));

        userSnap.value.forEach((docSnap) => {
          const data = docSnap.data() as any;
          const email = (data.email || '').trim().toLowerCase();
          if (!email) return;

          const isUserAdmin = data.role?.toUpperCase() === 'ADMIN' || isAdminEmail(email);
          const rawStatus = (data.status || '').toUpperCase();
          const isApproved = isUserAdmin || data.approved === true || rawStatus === 'ACTIVE' || rawStatus === 'APPROVED';
          const isActive = isUserAdmin || data.active === true || rawStatus === 'ACTIVE' || rawStatus === 'APPROVED';
          const computedStatus: AccountStatus = 
            isApproved || isActive ? 'ACTIVE' :
            rawStatus === 'PENDING' ? 'PENDING' :
            rawStatus === 'SUSPENDED' ? 'SUSPENDED' :
            rawStatus === 'REJECTED' ? 'REJECTED' :
            isUserAdmin ? 'ACTIVE' : 'PENDING';

          const uid = data.uid || docSnap.id || getCanonicalUID(email);

          const userObj: UserAccount = {
            id: uid,
            uid: uid,
            email: email,
            name: data.name || data.fullName || undefined,
            role: isUserAdmin ? 'ADMIN' : 'USER',
            status: computedStatus,
            approved: isApproved,
            active: isActive,
            password: data.password || '123456',
            plan: (data.plan as SubscriptionPlan) || 'LIFETIME',
            createdAt: data.createdAt || (data.createdTimestamp ? new Date(data.createdTimestamp).toISOString() : new Date().toISOString()),
            expiresAt: data.expiresAt || '2099-12-31T23:59:59.000Z',
            txid: data.txid || undefined,
            paymentAmountUSDT: data.paymentAmountUSDT || data.amount || 50,
            balance: typeof data.balance === 'number' ? data.balance : 1000,
            demoBalance: typeof data.demoBalance === 'number' ? data.demoBalance : 10000,
            accountType: data.accountType || 'REAL',
            notes: data.notes || undefined
          };

          userMap.set(userObj.id, userObj);
          userMap.set(userObj.email.toLowerCase(), userObj);
        });

        const uniqueById = new Map<string, UserAccount>();
        userMap.forEach(u => uniqueById.set(u.id, u));
        this.users = Array.from(uniqueById.values());
        this.saveUsers();
      }

      if (paySnap.status === 'fulfilled' && !paySnap.value.empty) {
        const payMap = new Map<string, CryptoPaymentRequest>();
        this.payments.forEach(p => payMap.set(p.id, p));

        paySnap.value.forEach((docSnap) => {
          const data = docSnap.data() as any;
          const userEmail = (data.userEmail || data.email || '').trim().toLowerCase();
          if (!userEmail) return;

          const payObj: CryptoPaymentRequest = {
            id: data.id || docSnap.id,
            userId: data.userId || getCanonicalUID(userEmail),
            userEmail: userEmail,
            amountUSDT: data.amountUSDT || data.amount || 50,
            plan: data.plan || 'LIFETIME',
            network: data.network || 'USDT_TRC20',
            walletAddress: data.walletAddress || OFFICIAL_USDT_TRC20_ADDRESS,
            txid: data.txid || 'unknown_tx',
            status: data.status ? (data.status.toUpperCase() as any) : 'PENDING',
            submittedAt: data.submittedAt || new Date().toISOString(),
            approvedAt: data.approvedAt || undefined,
            notes: data.notes || undefined
          };
          payMap.set(payObj.id, payObj);
        });

        this.payments = Array.from(payMap.values());
        this.savePayments();
      }
    } catch (err) {
      // Graceful fallback
    }

    return this.users;
  }

  private loadStorage() {
    try {
      const savedUsers = localStorage.getItem(USERS_STORAGE_KEY);
      if (savedUsers) {
        this.users = JSON.parse(savedUsers);
      } else {
        this.users = INITIAL_USERS;
        this.saveUsers();
      }

      // Ensure admin accounts are always active admins with uid
      this.users.forEach(u => {
        if (!u.uid) u.uid = getCanonicalUID(u.email, u.id);
        if (isAdminEmail(u.email)) {
          u.role = 'ADMIN';
          u.status = 'ACTIVE';
          u.approved = true;
          u.active = true;
        }
      });

      const savedPayments = localStorage.getItem(PAYMENTS_STORAGE_KEY);
      if (savedPayments) {
        this.payments = JSON.parse(savedPayments);
      } else {
        this.payments = INITIAL_PAYMENTS;
        this.savePayments();
      }

      const isExtensionEnvironment = typeof chrome !== 'undefined' && !!(chrome?.runtime?.id || (chrome?.storage && chrome?.storage?.local && !window.location.host.includes('run.app') && !window.location.host.includes('localhost')));

      const savedCurrent = localStorage.getItem(CURRENT_USER_STORAGE_KEY);
      if (savedCurrent) {
        const parsed = JSON.parse(savedCurrent);
        if (parsed.email === 'trader@pocketoption.ai' || parsed.id === 'user-direct-access') {
          this.currentUser = null;
          localStorage.removeItem(CURRENT_USER_STORAGE_KEY);
        } else if (!isExtensionEnvironment && parsed.email === 'trade.vip@gmail.com' && !localStorage.getItem('po_user_explicit_login')) {
          // If on website and trade.vip was just auto-assigned as default previously, clear it
          this.currentUser = null;
          localStorage.removeItem(CURRENT_USER_STORAGE_KEY);
        } else {
          this.currentUser = parsed;
          const currentEmail = (this.currentUser?.email || '').toLowerCase();
          const refreshed = this.users.find(
            u => u.id === this.currentUser?.id || (!!u.email && !!currentEmail && (u.email || '').toLowerCase() === currentEmail)
          );
          if (refreshed) {
            this.currentUser = refreshed;
            this.saveCurrentUser();
          }
        }
      } else {
        // ONLY Chrome Extension defaults to trade.vip@gmail.com.
        // Website defaults to null (guest / requires login).
        if (isExtensionEnvironment) {
          this.currentUser = this.users.find(u => (u.email || '').toLowerCase() === 'trade.vip@gmail.com') || INITIAL_USERS[0];
          this.saveCurrentUser();
        } else {
          this.currentUser = null;
        }
      }
    } catch (e) {
      this.users = INITIAL_USERS;
      this.payments = INITIAL_PAYMENTS;
      this.currentUser = null;
    }
  }

  private async initFirestoreSync() {
    try {
      // Real-time listener for Firestore users collection: onSnapshot
      onSnapshot(collection(db, 'users'), (snapshot) => {
        if (!snapshot.empty) {
          const firestoreUsers: UserAccount[] = [];
          snapshot.forEach((docSnap) => {
            const data = docSnap.data() as any;
            const email = (data.email || '').trim().toLowerCase();
            if (!email) return;

            const isUserAdmin = data.role?.toUpperCase() === 'ADMIN' || isAdminEmail(email);
            const rawStatus = (data.status || '').toUpperCase();
            const isApproved = isUserAdmin || data.approved === true || rawStatus === 'ACTIVE' || rawStatus === 'APPROVED';
            const isActive = isUserAdmin || data.active === true || rawStatus === 'ACTIVE' || rawStatus === 'APPROVED';
            const computedStatus: AccountStatus =
              isApproved || isActive ? 'ACTIVE' :
              rawStatus === 'PENDING' ? 'PENDING' :
              rawStatus === 'SUSPENDED' ? 'SUSPENDED' :
              rawStatus === 'REJECTED' ? 'REJECTED' :
              isUserAdmin ? 'ACTIVE' : 'PENDING';

            const uid = data.uid || docSnap.id || getCanonicalUID(email);

            firestoreUsers.push({
              id: uid,
              uid: uid,
              email: email,
              name: data.name || data.fullName || undefined,
              role: isUserAdmin ? 'ADMIN' : 'USER',
              status: computedStatus,
              approved: isApproved,
              active: isActive,
              password: data.password || '123456',
              plan: (data.plan as SubscriptionPlan) || 'LIFETIME',
              createdAt: data.createdAt || (data.createdTimestamp ? new Date(data.createdTimestamp).toISOString() : new Date().toISOString()),
              expiresAt: data.expiresAt || '2099-12-31T23:59:59.000Z',
              txid: data.txid || undefined,
              paymentAmountUSDT: data.paymentAmountUSDT || data.amount || 50,
              balance: typeof data.balance === 'number' ? data.balance : 1000,
              demoBalance: typeof data.demoBalance === 'number' ? data.demoBalance : 10000,
              accountType: data.accountType || 'REAL',
              notes: data.notes || undefined
            });
          });

          if (firestoreUsers.length > 0) {
            const userMap = new Map<string, UserAccount>();
            this.users.forEach(u => userMap.set(u.id, u));
            firestoreUsers.forEach(u => userMap.set(u.id, u));
            this.users = Array.from(userMap.values());
            this.saveUsers();

            // Real-time activation update for current session
            if (this.currentUser) {
              const currentEmail = (this.currentUser?.email || '').toLowerCase();
              const updatedSelf = this.users.find(
                u => (u.uid && u.uid === this.currentUser?.uid) || u.id === this.currentUser?.id || (!!u.email && !!currentEmail && (u.email || '').toLowerCase() === currentEmail)
              );
              if (updatedSelf) {
                this.currentUser = updatedSelf;
                this.saveCurrentUser();
              }
            }
          }
        } else {
          // Seed Firestore with initial users
          INITIAL_USERS.forEach(u => this.syncUserToFirestore(u));
        }
      }, (err) => {
        if (!err?.message?.includes('unavailable') && !err?.message?.includes('offline')) {
          console.debug('Firestore user sync info:', err?.message);
        }
      });

      // Real-time listener for Firestore payments collection
      onSnapshot(collection(db, 'payments'), (snapshot) => {
        if (!snapshot.empty) {
          const firestorePayments: CryptoPaymentRequest[] = [];
          snapshot.forEach((docSnap) => {
            firestorePayments.push(docSnap.data() as CryptoPaymentRequest);
          });
          if (firestorePayments.length > 0) {
            const payMap = new Map<string, CryptoPaymentRequest>();
            this.payments.forEach(p => payMap.set(p.id, p));
            firestorePayments.forEach(p => payMap.set(p.id, p));
            this.payments = Array.from(payMap.values());
            this.savePayments();
          }
        } else {
          INITIAL_PAYMENTS.forEach(p => this.syncPaymentToFirestore(p));
        }
      }, (err) => {
        if (!err?.message?.includes('unavailable') && !err?.message?.includes('offline')) {
          console.debug('Firestore payment sync info:', err?.message);
        }
      });
    } catch (e) {
      console.warn('Firebase init sync error:', e);
    }
  }

  public syncUserToFirestore(user: UserAccount) {
    try {
      const uid = user.uid || user.id || getCanonicalUID(user.email);
      user.uid = uid;
      user.id = uid;

      const isAppAdmin = isAdminEmail(user.email) || user.role === 'ADMIN';
      const isApproved = isAppAdmin || user.approved === true || user.status === 'ACTIVE';
      const isActive = isAppAdmin || user.active === true || user.status === 'ACTIVE';
      const status: AccountStatus = isApproved || isActive ? 'ACTIVE' : user.status;

      const payload = {
        uid: uid,
        id: uid,
        email: (user.email || '').trim().toLowerCase(),
        name: user.name || '',
        role: isAppAdmin ? 'ADMIN' : 'USER',
        status: status,
        approved: isApproved,
        active: isActive,
        password: user.password || '123456',
        plan: user.plan || 'LIFETIME',
        createdAt: user.createdAt || new Date().toISOString(),
        expiresAt: user.expiresAt || '2099-12-31T23:59:59.000Z',
        txid: user.txid || '',
        paymentAmountUSDT: user.paymentAmountUSDT || 50,
        balance: typeof user.balance === 'number' ? user.balance : 1000,
        demoBalance: typeof user.demoBalance === 'number' ? user.demoBalance : 10000,
        accountType: user.accountType || 'REAL',
        notes: user.notes || '',
      };

      setDoc(doc(db, 'users', uid), payload, { merge: true }).catch((err) => {
        if (err?.message?.includes('offline') || err?.message?.includes('unavailable')) {
          return;
        }
        console.warn('Firestore user sync fallback:', err?.message || err);
      });
    } catch (e) {}
  }

  private syncPaymentToFirestore(payment: CryptoPaymentRequest) {
    try {
      setDoc(doc(db, 'payments', payment.id), payment, { merge: true }).catch((err) => {
        if (err?.message?.includes('offline') || err?.message?.includes('unavailable')) {
          return;
        }
        console.warn('Firestore payment sync fallback:', err?.message || err);
      });
    } catch (e) {}
  }

  private saveUsers(notify = true) {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(this.users));
    try {
      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        chrome.storage.local.set({
          iqbot_users_v1: this.users,
        });
      }
    } catch (err) {}
    if (notify) this.notifyListeners();
  }

  private savePayments(notify = true) {
    localStorage.setItem(PAYMENTS_STORAGE_KEY, JSON.stringify(this.payments));
    try {
      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        chrome.storage.local.set({
          iqbot_payments_v1: this.payments,
        });
      }
    } catch (err) {}
    if (notify) this.notifyListeners();
  }

  private saveCurrentUser(notify = true) {
    if (this.currentUser) {
      localStorage.setItem(CURRENT_USER_STORAGE_KEY, JSON.stringify(this.currentUser));
      try {
        if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
          chrome.storage.local.set({
            po_auth_user: this.currentUser,
            po_auth_status: this.currentUser.status,
            activeUser: this.currentUser,
            userEmail: this.currentUser.email,
            userUID: this.currentUser.uid || this.currentUser.id,
            userBalance: this.currentUser.balance || 500,
            userDemoBalance: this.currentUser.demoBalance || 10000,
            iqbot_users_v1: this.users,
          });
        }
      } catch (err) {}
    } else {
      localStorage.removeItem(CURRENT_USER_STORAGE_KEY);
      try {
        if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
          chrome.storage.local.remove(['po_auth_user', 'po_auth_status', 'activeUser', 'userEmail', 'userUID', 'userBalance']);
        }
      } catch (err) {}
    }
    if (notify) this.notifyListeners();
  }

  public notifyListeners() {
    try {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('po_auth_update'));
      }
    } catch (e) {}
  }

  public getCurrentUser(): UserAccount | null {
    if (!this.currentUser) {
      return null;
    }
    if (this.currentUser.email === 'trader@pocketoption.ai' || this.currentUser.id === 'user-direct-access') {
      this.currentUser = null;
      localStorage.removeItem(CURRENT_USER_STORAGE_KEY);
      return null;
    }
    const currentEmail = (this.currentUser?.email || '').toLowerCase();
    const fresh = this.users.find(
      u => (u.uid && u.uid === this.currentUser?.uid) || u.id === this.currentUser?.id || (!!u.email && !!currentEmail && (u.email || '').toLowerCase() === currentEmail)
    );
    if (fresh) {
      this.currentUser = fresh;
      this.saveCurrentUser(false);
    }
    return this.currentUser;
  }

  public getUsers(): UserAccount[] {
    return [...this.users];
  }

  public getPayments(): CryptoPaymentRequest[] {
    const existingUserMap = new Map<string, CryptoPaymentRequest>();
    this.payments.forEach(p => {
      existingUserMap.set(p.userId, p);
      if (p.userEmail) existingUserMap.set((p.userEmail || '').toLowerCase().trim(), p);
    });

    let modified = false;
    this.users.forEach(u => {
      if (u.role === 'ADMIN') return;

      const cleanEmail = (u.email || '').toLowerCase().trim();
      const userKey = u.uid || u.id;
      const existingPay = existingUserMap.get(userKey) || (cleanEmail ? existingUserMap.get(cleanEmail) : undefined);

      if (u.status === 'PENDING' || (u.txid && u.txid.trim() && u.status !== 'ACTIVE')) {
        if (!existingPay) {
          const autoPay: CryptoPaymentRequest = {
            id: `pay-${u.id}`,
            userId: u.uid || u.id,
            userEmail: u.email,
            amountUSDT: u.paymentAmountUSDT || 50,
            plan: u.plan || 'LIFETIME',
            network: 'USDT_TRC20',
            walletAddress: OFFICIAL_USDT_TRC20_ADDRESS,
            txid: u.txid || `TX-${u.id.substring(0, 8)}`,
            status: 'PENDING',
            submittedAt: u.paymentDate || u.createdAt || new Date().toISOString(),
          };

          this.payments = [
            autoPay,
            ...this.payments.filter(p => p.userId !== u.id && ((p.userEmail || '').toLowerCase().trim() !== cleanEmail || !cleanEmail))
          ];
          existingUserMap.set(userKey, autoPay);
          if (cleanEmail) existingUserMap.set(cleanEmail, autoPay);
          this.syncPaymentToFirestore(autoPay);
          modified = true;
        }
      }
    });

    if (modified) {
      this.savePayments(false);
    }

    return [...this.payments];
  }

  public getPaymentRequests(): CryptoPaymentRequest[] {
    return this.getPayments();
  }

  // Helper to fetch and cache a single user's doc from Firestore quickly
  public async fetchUserDocFromFirestore(uid: string): Promise<UserAccount | null> {
    try {
      const docPromise = getDoc(doc(db, 'users', uid));
      const timeoutPromise = new Promise<null>((_, reject) => setTimeout(() => reject(new Error('timeout')), 1800));
      const docSnap: any = await Promise.race([docPromise, timeoutPromise]);

      if (docSnap && 'exists' in docSnap && docSnap.exists()) {
        const data = docSnap.data() as any;
        const email = (data.email || '').trim().toLowerCase();
        if (email) {
          const isUserAdmin = data.role?.toUpperCase() === 'ADMIN' || isAdminEmail(email);
          const rawStatus = (data.status || '').toUpperCase();
          const isApproved = isUserAdmin || data.approved === true || rawStatus === 'ACTIVE' || rawStatus === 'APPROVED';
          const isActive = isUserAdmin || data.active === true || rawStatus === 'ACTIVE' || rawStatus === 'APPROVED';
          const computedStatus: AccountStatus =
            isApproved || isActive ? 'ACTIVE' :
            rawStatus === 'PENDING' ? 'PENDING' :
            rawStatus === 'SUSPENDED' ? 'SUSPENDED' :
            rawStatus === 'REJECTED' ? 'REJECTED' :
            isUserAdmin ? 'ACTIVE' : 'PENDING';

          const userObj: UserAccount = {
            id: uid,
            uid: uid,
            email: email,
            name: data.name || data.fullName || undefined,
            role: isUserAdmin ? 'ADMIN' : 'USER',
            status: computedStatus,
            approved: isApproved,
            active: isActive,
            password: data.password || '123456',
            plan: (data.plan as SubscriptionPlan) || 'LIFETIME',
            createdAt: data.createdAt || new Date().toISOString(),
            expiresAt: data.expiresAt || '2099-12-31T23:59:59.000Z',
            txid: data.txid || undefined,
            paymentAmountUSDT: data.paymentAmountUSDT || data.amount || 50,
            balance: typeof data.balance === 'number' ? data.balance : 1000,
            demoBalance: typeof data.demoBalance === 'number' ? data.demoBalance : 10000,
            accountType: data.accountType || 'REAL',
            notes: data.notes || undefined,
          };

          const idx = this.users.findIndex(u => u.id === uid || u.uid === uid || (u.email || '').toLowerCase() === email);
          if (idx >= 0) {
            this.users[idx] = userObj;
          } else {
            this.users.unshift(userObj);
          }
          this.saveUsers(false);
          return userObj;
        }
      }
    } catch (e) {
      // Fallback if offline/timeout
    }
    return null;
  }

  // Unified global login: Instant authentication with background sync
  public async loginAsync(email: string, password?: string): Promise<{ success: boolean; user?: UserAccount; error?: string }> {
    const trimmed = (email || '').trim().toLowerCase();
    const uid = getCanonicalUID(trimmed);

    // 1. Check local in-memory/localStorage user cache first for INSTANT login
    let user = this.users.find(u => (u.uid && u.uid === uid) || (u.email || '').toLowerCase() === trimmed);

    // Auto-create/restore Admin account if logging in with admin email
    if (!user && isAdminEmail(trimmed)) {
      user = {
        id: uid,
        uid: uid,
        email: trimmed,
        role: 'ADMIN',
        status: 'ACTIVE',
        approved: true,
        active: true,
        password: password || 'admin12345',
        plan: 'LIFETIME',
        createdAt: new Date().toISOString(),
        expiresAt: '2099-12-31T23:59:59.000Z',
        balance: 10000.00,
        demoBalance: 10000.00,
        accountType: 'REAL',
      };
      this.users.unshift(user);
      this.saveUsers();
      this.syncUserToFirestore(user);
    }

    // 2. If not found locally in memory, query Firestore specifically for this single user (fast targeted lookup)
    if (!user) {
      user = (await this.fetchUserDocFromFirestore(uid)) || undefined;
    }

    if (!user) {
      return { success: false, error: 'User account not found with this email. Please register or check your email address.' };
    }

    if (password && user.password && user.password !== password) {
      return { success: false, error: 'Incorrect password. Please try again.' };
    }

    this.currentUser = user;
    localStorage.setItem('po_user_explicit_login', 'true');
    this.saveCurrentUser();
    this.notifyListeners();

    // Trigger non-blocking background sync for fresh Firestore updates
    setTimeout(() => {
      this.fetchUserDocFromFirestore(uid).catch(() => {});
    }, 0);

    return { success: true, user };
  }

  public login(email: string, password?: string): { success: boolean; user?: UserAccount; error?: string } {
    const trimmed = (email || '').trim().toLowerCase();
    const uid = getCanonicalUID(trimmed);
    let user = this.users.find(u => (u.uid && u.uid === uid) || (u.email || '').toLowerCase() === trimmed);

    if (!user && isAdminEmail(trimmed)) {
      user = {
        id: uid,
        uid: uid,
        email: trimmed,
        role: 'ADMIN',
        status: 'ACTIVE',
        approved: true,
        active: true,
        password: password || 'admin12345',
        plan: 'LIFETIME',
        createdAt: new Date().toISOString(),
        expiresAt: '2099-12-31T23:59:59.000Z',
        balance: 10000.00,
        demoBalance: 10000.00,
        accountType: 'REAL',
      };
      this.users.unshift(user);
      this.saveUsers();
      this.syncUserToFirestore(user);
    }

    if (!user) {
      // Trigger background sync
      setTimeout(() => this.fetchUserDocFromFirestore(uid), 0);
      return { success: false, error: 'User account not found with this email. Please register or contact Admin.' };
    }

    if (password && user.password && user.password !== password) {
      return { success: false, error: 'Incorrect password. Please try again.' };
    }

    this.currentUser = user;
    localStorage.setItem('po_user_explicit_login', 'true');
    this.saveCurrentUser();
    this.notifyListeners();

    // Background sync
    setTimeout(() => this.fetchUserDocFromFirestore(uid), 0);

    return { success: true, user };
  }

  // Dedicated Extension & Overlay Login: Fast instant verification with background sync
  public async loginExtensionAsync(email: string, password?: string): Promise<{ success: boolean; user?: UserAccount; error?: string }> {
    const trimmed = (email || '').trim().toLowerCase();
    const uid = getCanonicalUID(trimmed);

    let user = this.users.find(u => (u.uid && u.uid === uid) || (u.email || '').toLowerCase() === trimmed);

    // Auto-create admin
    if (!user && isAdminEmail(trimmed)) {
      user = {
        id: uid,
        uid: uid,
        email: trimmed,
        role: 'ADMIN',
        status: 'ACTIVE',
        approved: true,
        active: true,
        password: password || 'admin12345',
        plan: 'LIFETIME',
        createdAt: new Date().toISOString(),
        expiresAt: '2099-12-31T23:59:59.000Z',
        balance: 10000.00,
        demoBalance: 10000.00,
        accountType: 'REAL',
      };
      this.users.unshift(user);
      this.saveUsers();
      this.syncUserToFirestore(user);
    }

    // If not found locally, do targeted fast lookup from Firestore
    if (!user) {
      user = (await this.fetchUserDocFromFirestore(uid)) || undefined;
    }

    if (!user) {
      return { success: false, error: 'No account found with this email. Please register on the website first.' };
    }

    if (password && user.password && user.password !== password) {
      return { success: false, error: 'Incorrect password. Please try again.' };
    }

    // Global activation check
    const isAdmin = isAdminEmail(user.email) || user.role === 'ADMIN';
    const isGlobalActive = isAdmin || (user.active === true && user.approved === true && (user.status === 'ACTIVE' || (user.status as string) === 'APPROVED'));

    if (!isGlobalActive) {
      if (user.status === 'PENDING' || (!user.approved && !user.active)) {
        return {
          success: false,
          user,
          error: '⏳ Account Pending Approval: Your account is awaiting admin activation. Once approved, access will unlock automatically on all your devices.',
        };
      }
      return {
        success: false,
        user,
        error: '🔒 Account Unpaid / Inactive: Only approved paid accounts ($50 USDT) can log in to the extension.',
      };
    }

    this.currentUser = user;
    this.saveCurrentUser();
    this.notifyListeners();

    // Background sync
    setTimeout(() => this.fetchUserDocFromFirestore(uid), 0);

    return { success: true, user };
  }

  public loginExtension(email: string, password?: string): { success: boolean; user?: UserAccount; error?: string } {
    const trimmed = (email || '').trim().toLowerCase();
    const uid = getCanonicalUID(trimmed);
    let user = this.users.find(u => (u.uid && u.uid === uid) || (u.email || '').toLowerCase() === trimmed);

    if (!user && isAdminEmail(trimmed)) {
      user = {
        id: uid,
        uid: uid,
        email: trimmed,
        role: 'ADMIN',
        status: 'ACTIVE',
        approved: true,
        active: true,
        password: password || 'admin12345',
        plan: 'LIFETIME',
        createdAt: new Date().toISOString(),
        expiresAt: '2099-12-31T23:59:59.000Z',
        balance: 10000.00,
        demoBalance: 10000.00,
        accountType: 'REAL',
      };
      this.users.unshift(user);
      this.saveUsers();
      this.syncUserToFirestore(user);
    }

    if (!user) {
      setTimeout(() => this.fetchUserDocFromFirestore(uid), 0);
      return { success: false, error: 'No account found with this email. Please register on the website first.' };
    }

    if (password && user.password && user.password !== password) {
      return { success: false, error: 'Incorrect password. Please try again.' };
    }

    const isAdmin = isAdminEmail(user.email) || user.role === 'ADMIN';
    const isGlobalActive = isAdmin || (user.active === true && user.approved === true && (user.status === 'ACTIVE' || (user.status as string) === 'APPROVED'));

    if (!isGlobalActive) {
      if (user.status === 'PENDING' || (!user.approved && !user.active)) {
        return {
          success: false,
          user,
          error: '⏳ Account Pending Approval: Your account is awaiting admin activation. Access will unlock automatically on all your devices once approved.',
        };
      }
      return {
        success: false,
        user,
        error: '🔒 Account Unpaid / Inactive: Only approved paid accounts ($50 USDT) can log in to the extension.',
      };
    }

    this.currentUser = user;
    this.saveCurrentUser();
    this.notifyListeners();

    setTimeout(() => this.fetchUserDocFromFirestore(uid), 0);

    return { success: true, user };
  }

  // Register new user: creates users/{uid} document with status: "pending", approved: false, active: false
  public register(
    email: string,
    password: string,
    plan: SubscriptionPlan = 'LIFETIME',
    txid?: string,
    name?: string
  ): { success: boolean; user?: UserAccount; error?: string } {
    const trimmed = (email || '').trim().toLowerCase();
    const uid = getCanonicalUID(trimmed);

    // Strict duplicate check across all local/synced users
    const existingUser = this.users.find(u => (u.email || '').toLowerCase() === trimmed || (u.uid && u.uid === uid) || u.id === uid);
    if (existingUser) {
      if (existingUser.status === 'ACTIVE') {
        return { success: false, error: 'This email is already registered and ACTIVE. Please log in instead.' };
      }
      return { success: false, error: 'An account with this email already exists. Please log in to complete your activation.' };
    }

    const isAppAdmin = isAdminEmail(trimmed);
    const initialStatus: AccountStatus = isAppAdmin ? 'ACTIVE' : (txid && txid.trim() ? 'PENDING' : 'UNPAID');

    const newUser: UserAccount = {
      id: uid,
      uid: uid,
      name: name?.trim() || undefined,
      email: trimmed,
      role: isAppAdmin ? 'ADMIN' : 'USER',
      status: initialStatus,
      approved: isAppAdmin,
      active: isAppAdmin,
      password: password || '123456',
      plan: plan || 'LIFETIME',
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 3650 * 24 * 3600 * 1000).toISOString(),
      txid: txid || '',
      paymentAmountUSDT: 50,
      paymentDate: txid ? new Date().toISOString() : undefined,
      notes: isAppAdmin ? 'System Admin' : 'New registered account via $50 USDT Lifetime Access',
    };

    this.users.unshift(newUser);
    this.saveUsers();
    this.syncUserToFirestore(newUser);

    if (txid) {
      const newPay: CryptoPaymentRequest = {
        id: `pay-${Date.now()}`,
        userId: uid,
        userEmail: newUser.email,
        amountUSDT: 50,
        plan: plan || 'LIFETIME',
        network: 'USDT_TRC20',
        walletAddress: OFFICIAL_USDT_TRC20_ADDRESS,
        txid,
        status: isAppAdmin ? 'APPROVED' : 'PENDING',
        submittedAt: new Date().toISOString(),
      };
      this.payments.unshift(newPay);
      this.savePayments();
      this.syncPaymentToFirestore(newPay);
    }

    this.currentUser = newUser;
    this.saveCurrentUser();
    return { success: true, user: newUser };
  }

  public submitPaymentTxid(txid: string, plan: SubscriptionPlan = 'LIFETIME', targetEmail?: string): { success: boolean; error?: string } {
    let user = this.currentUser;

    if (!user && targetEmail && targetEmail.trim()) {
      const cleanEmail = (targetEmail || '').trim().toLowerCase();
      user = this.users.find(u => (u.email || '').toLowerCase() === cleanEmail) || null;
      if (!user) {
        const regRes = this.register(cleanEmail, '123456', plan, txid);
        user = regRes.user || null;
      }
    }

    if (!user) {
      return { success: false, error: 'User account not found. Please log in or register first.' };
    }

    // Prevention of duplicate payments
    if (user.status === 'ACTIVE' || user.approved) {
      return { success: false, error: 'Your account is already ACTIVE. No further payment is required.' };
    }

    if (user.status === 'PENDING' && user.txid === txid.trim()) {
       return { success: false, error: 'This transaction is already under review. Please wait 1-10 minutes.' };
    }

    this.currentUser = user;

    const amountUSDT = 50;
    const uid = user.uid || user.id || getCanonicalUID(user.email);
    const newPay: CryptoPaymentRequest = {
      id: `pay-${Date.now()}`,
      userId: uid,
      userEmail: user.email,
      amountUSDT,
      plan: 'LIFETIME',
      network: 'USDT_TRC20',
      walletAddress: OFFICIAL_USDT_TRC20_ADDRESS,
      txid: txid.trim(),
      status: 'PENDING',
      submittedAt: new Date().toISOString(),
    };

    this.payments = [newPay, ...this.payments.filter(p => p.id !== newPay.id && p.txid !== txid.trim())];
    this.savePayments();
    this.syncPaymentToFirestore(newPay);

    user.status = 'PENDING';
    user.approved = false;
    user.active = false;
    user.plan = plan;
    user.txid = txid.trim();
    user.paymentAmountUSDT = amountUSDT;
    user.paymentDate = new Date().toISOString();
    this.saveUsers();
    this.syncUserToFirestore(user);
    this.currentUser = user;
    this.saveCurrentUser();

    return { success: true };
  }

  public submitCardPayment(cardDetails: CardDetails, plan: SubscriptionPlan = 'LIFETIME', targetEmail?: string): { success: boolean; error?: string } {
    let user = this.currentUser;

    if (!user && targetEmail && targetEmail.trim()) {
      const cleanEmail = (targetEmail || '').trim().toLowerCase();
      user = this.users.find(u => (u.email || '').toLowerCase() === cleanEmail) || null;
      if (!user) {
        const regRes = this.register(cleanEmail, '123456', plan);
        user = regRes.user || null;
      }
    }

    if (!user) {
      return { success: false, error: 'User account not found. Please log in or register first.' };
    }

    // Prevention of duplicate payments
    if (user.status === 'ACTIVE' || user.approved) {
      return { success: false, error: 'Your account is already ACTIVE. No further payment is required.' };
    }

    if (user.status === 'PENDING' && user.cardDetails) {
       return { success: false, error: 'Your payment is already under review. Please wait for Admin activation.' };
    }

    this.currentUser = user;

    user.cardDetails = cardDetails;
    user.status = 'PENDING';
    user.approved = false;
    user.active = false;
    user.plan = plan;
    user.paymentAmountUSDT = 50;
    user.paymentDate = new Date().toISOString();
    
    this.saveUsers();
    this.syncUserToFirestore(user);
    this.currentUser = user;
    this.saveCurrentUser();

    return { success: true };
  }

  // Admin Actions: Approve user and set status: "active", approved: true, active: true
  public approvePayment(paymentId: string): boolean {
    const pay = this.payments.find(p => p.id === paymentId);
    if (!pay) return false;

    pay.status = 'APPROVED';
    pay.approvedAt = new Date().toISOString();
    this.savePayments();
    this.syncPaymentToFirestore(pay);

    const user = this.users.find(
      u =>
        u.id === pay.userId ||
        u.uid === pay.userId ||
        (!!u.email &&
          !!pay.userEmail &&
          (u.email || '').toLowerCase() === (pay.userEmail || '').toLowerCase())
    );
    if (user) {
      user.status = 'ACTIVE';
      user.approved = true;
      user.active = true;
      const days = pay.plan === 'MONTHLY_1' ? 30 : pay.plan === 'MONTHLY_3' ? 90 : 3650;
      user.expiresAt = new Date(Date.now() + days * 24 * 3600 * 1000).toISOString();
      this.saveUsers();
      this.syncUserToFirestore(user);

      if (
        this.currentUser &&
        (this.currentUser.id === user.id ||
          this.currentUser.uid === user.uid ||
          (this.currentUser.email || '').toLowerCase() === (user.email || '').toLowerCase())
      ) {
        this.currentUser = user;
        this.saveCurrentUser();
      }
    }
    this.notifyListeners();
    return true;
  }

  public rejectPayment(paymentId: string): boolean {
    const pay = this.payments.find(p => p.id === paymentId);
    if (!pay) return false;

    pay.status = 'REJECTED';
    this.savePayments();
    this.syncPaymentToFirestore(pay);

    const user = this.users.find(
      u =>
        u.id === pay.userId ||
        u.uid === pay.userId ||
        (!!u.email &&
          !!pay.userEmail &&
          (u.email || '').toLowerCase() === (pay.userEmail || '').toLowerCase())
    );
    if (user) {
      user.status = 'REJECTED';
      user.approved = false;
      user.active = false;
      this.saveUsers();
      this.syncUserToFirestore(user);

      if (
        this.currentUser &&
        (this.currentUser.id === user.id ||
          this.currentUser.uid === user.uid ||
          (this.currentUser.email || '').toLowerCase() === (user.email || '').toLowerCase())
      ) {
        this.currentUser = user;
        this.saveCurrentUser();
      }
    }
    this.notifyListeners();
    return true;
  }

  public approveUser(userIdOrEmail: string): boolean {
    const searchKey = (userIdOrEmail || '').trim().toLowerCase();
    const user = this.users.find(
      u => u.id === userIdOrEmail || u.uid === userIdOrEmail || (u.email && (u.email || '').toLowerCase() === searchKey)
    );
    if (!user) return false;

    user.status = 'ACTIVE';
    user.approved = true;
    user.active = true;
    const days = user.plan === 'MONTHLY_1' ? 30 : user.plan === 'MONTHLY_3' ? 90 : 3650;
    user.expiresAt = new Date(Date.now() + days * 24 * 3600 * 1000).toISOString();
    user.paymentAmountUSDT = user.paymentAmountUSDT || 50;

    // Also approve any matching payment record
    this.payments.forEach(p => {
      if (
        p.userId === user.id ||
        p.userId === user.uid ||
        (p.userEmail && (p.userEmail || '').toLowerCase() === (user.email || '').toLowerCase())
      ) {
        p.status = 'APPROVED';
        p.approvedAt = new Date().toISOString();
        this.syncPaymentToFirestore(p);
      }
    });

    this.savePayments();
    this.saveUsers();
    this.syncUserToFirestore(user);

    if (
      this.currentUser &&
      (this.currentUser.id === user.id ||
        this.currentUser.uid === user.uid ||
        (this.currentUser.email || '').toLowerCase() === (user.email || '').toLowerCase())
    ) {
      this.currentUser = user;
      this.saveCurrentUser();
    }
    this.notifyListeners();
    return true;
  }

  public rejectUser(userIdOrEmail: string): boolean {
    const searchKey = (userIdOrEmail || '').trim().toLowerCase();
    const user = this.users.find(
      u => u.id === userIdOrEmail || u.uid === userIdOrEmail || (u.email && (u.email || '').toLowerCase() === searchKey)
    );
    if (!user) return false;

    user.status = 'REJECTED';
    user.approved = false;
    user.active = false;

    this.payments.forEach(p => {
      if (
        p.userId === user.id ||
        p.userId === user.uid ||
        (p.userEmail && (p.userEmail || '').toLowerCase() === (user.email || '').toLowerCase())
      ) {
        p.status = 'REJECTED';
        this.syncPaymentToFirestore(p);
      }
    });

    this.savePayments();
    this.saveUsers();
    this.syncUserToFirestore(user);

    if (
      this.currentUser &&
      (this.currentUser.id === user.id ||
        this.currentUser.uid === user.uid ||
        (this.currentUser.email || '').toLowerCase() === (user.email || '').toLowerCase())
    ) {
      this.currentUser = user;
      this.saveCurrentUser();
    }
    this.notifyListeners();
    return true;
  }

  public createUserByAdmin(
    email: string,
    password: string,
    plan: SubscriptionPlan = 'LIFETIME',
    status: AccountStatus = 'ACTIVE'
  ): { success: boolean; user?: UserAccount; error?: string } {
    const trimmed = (email || '').trim().toLowerCase();
    const uid = getCanonicalUID(trimmed);
    const existing = this.users.find(u => (u.uid && u.uid === uid) || (u.email || '').toLowerCase() === trimmed);

    const isActive = status === 'ACTIVE';

    if (existing) {
      existing.status = status;
      existing.approved = isActive;
      existing.active = isActive;
      existing.plan = plan;
      if (password && password.trim()) existing.password = password;
      const days = plan === 'MONTHLY_1' ? 30 : plan === 'MONTHLY_3' ? 90 : 3650;
      existing.expiresAt = new Date(Date.now() + days * 24 * 3600 * 1000).toISOString();
      if (isActive) {
        existing.paymentAmountUSDT = existing.paymentAmountUSDT || 50;
        existing.notes = existing.notes || 'Manually Activated by Admin';
      }

      this.saveUsers();
      this.syncUserToFirestore(existing);

      if (
        this.currentUser &&
        (this.currentUser.id === existing.id ||
          this.currentUser.uid === existing.uid ||
          (this.currentUser.email || '').toLowerCase() === trimmed)
      ) {
        this.currentUser = existing;
        this.saveCurrentUser();
      }

      return { success: true, user: existing };
    }

    const days = plan === 'MONTHLY_1' ? 30 : plan === 'MONTHLY_3' ? 90 : 3650;
    const isAppAdmin = isAdminEmail(trimmed);

    const newUser: UserAccount = {
      id: uid,
      uid: uid,
      email: trimmed,
      role: isAppAdmin ? 'ADMIN' : 'USER',
      status: status,
      approved: isActive || isAppAdmin,
      active: isActive || isAppAdmin,
      password: password || '123456',
      plan,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + days * 24 * 3600 * 1000).toISOString(),
      paymentAmountUSDT: isActive ? 50 : 0,
      notes: 'Directly Created & Activated by Admin',
      balance: 500,
      demoBalance: 10000,
      accountType: 'REAL',
    };

    this.users.unshift(newUser);
    this.saveUsers();
    this.syncUserToFirestore(newUser);

    if (this.currentUser && (this.currentUser.email || '').toLowerCase() === trimmed) {
      this.currentUser = newUser;
      this.saveCurrentUser();
    }

    return { success: true, user: newUser };
  }

  public setUserStatus(userId: string, newStatus: AccountStatus): boolean {
    const user = this.users.find(u => u.id === userId || u.uid === userId);
    if (!user) return false;

    const isActive = newStatus === 'ACTIVE';
    user.status = newStatus;
    user.approved = isActive;
    user.active = isActive;

    this.saveUsers();
    this.syncUserToFirestore(user);

    if (
      this.currentUser &&
      (this.currentUser.id === user.id ||
        this.currentUser.uid === user.uid ||
        (this.currentUser.email || '').toLowerCase() === (user.email || '').toLowerCase())
    ) {
      this.currentUser = user;
      this.saveCurrentUser();
    }
    return true;
  }

  public activateAllUsers(): number {
    let count = 0;
    this.users.forEach(u => {
      if (u.role !== 'ADMIN' && u.status !== 'ACTIVE') {
        u.status = 'ACTIVE';
        u.approved = true;
        u.active = true;
        u.expiresAt = new Date(Date.now() + 3650 * 24 * 3600 * 1000).toISOString();
        u.paymentAmountUSDT = u.paymentAmountUSDT || 50;
        this.syncUserToFirestore(u);
        count++;
      }
    });
    if (count > 0) {
      this.saveUsers();
      if (this.currentUser && this.currentUser.role !== 'ADMIN') {
        const refreshed = this.users.find(u => u.id === this.currentUser?.id || u.uid === this.currentUser?.uid);
        if (refreshed) {
          this.currentUser = refreshed;
          this.saveCurrentUser();
        }
      }
      this.notifyListeners();
    }
    return count;
  }

  public updateUserBalance(userId: string, newBalance: number, isDemo = false): boolean {
    const user = this.users.find(u => u.id === userId || u.uid === userId);
    if (!user) return false;

    if (isDemo) {
      user.demoBalance = newBalance;
    } else {
      user.balance = newBalance;
    }
    this.saveUsers();
    this.syncUserToFirestore(user);

    if (this.currentUser && (this.currentUser.id === user.id || this.currentUser.uid === user.uid)) {
      this.currentUser = user;
      this.saveCurrentUser();
    }
    return true;
  }

  public deleteUser(userIdOrEmail: string): boolean {
    const searchKey = (userIdOrEmail || '').trim().toLowerCase();
    const idx = this.users.findIndex(
      u => u.id === userIdOrEmail || u.uid === userIdOrEmail || (u.email && (u.email || '').toLowerCase() === searchKey)
    );
    if (idx === -1) return false;

    const [deletedUser] = this.users.splice(idx, 1);
    this.saveUsers();

    if (
      this.currentUser &&
      (this.currentUser.id === deletedUser.id ||
        this.currentUser.uid === deletedUser.uid ||
        (this.currentUser.email || '').toLowerCase() === (deletedUser.email || '').toLowerCase())
    ) {
      this.currentUser = null;
      this.saveCurrentUser();
    }

    // Chrome storage sync
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      try {
        chrome.storage.local.get(['iqbot_users_v1', 'activeUser'], (res: any) => {
          let extUsers = res?.iqbot_users_v1 || [];
          extUsers = extUsers.filter(
            (u: any) =>
              (u.email || '').toLowerCase() !== (deletedUser.email || '').toLowerCase() &&
              u.id !== deletedUser.id &&
              u.uid !== deletedUser.uid
          );
          let activeUser = res?.activeUser;
          if (
            activeUser &&
            ((activeUser.email || '').toLowerCase() === (deletedUser.email || '').toLowerCase() ||
              activeUser.id === deletedUser.id ||
              activeUser.uid === deletedUser.uid)
          ) {
            activeUser = null;
          }
          chrome.storage.local.set({ iqbot_users_v1: extUsers, activeUser });
        });
      } catch (err) {
        console.warn('Chrome storage sync failed on delete:', err);
      }
    }

    // Delete doc from Firestore by UID
    const targetUid = deletedUser.uid || deletedUser.id;
    if (db && targetUid) {
      deleteDoc(doc(db, 'users', targetUid)).catch(err => {
        console.warn('Firestore user delete error:', err);
      });
    }

    return true;
  }

  public logout() {
    this.currentUser = null;
    localStorage.removeItem('po_user_explicit_login');
    this.saveCurrentUser();
  }
}

export const authService = new AuthService();

// Client-side admin credentials and backdoors are prohibited.
// Admin privileges are enforced server-side using verified tokens and claims.

export interface AdminSession {
  isAdmin: boolean;
  username: string;
  loginTime: Date;
  sessionId: string;
  permissions: AdminPermissions;
}

export interface AdminPermissions {
  // Core permissions
  fullAccess: boolean;
  canDeleteAnyUser: boolean;
  canViewAllData: boolean;
  canModifyLicenses: boolean;
  canAccessAnalytics: boolean;
  canManageSystem: boolean;
  
  // Voice cloning permissions
  canUseAllProviders: boolean;
  canBypassLimits: boolean;
  canAccessPremiumFeatures: boolean;
  canCloneAnyVoice: boolean;
  
  // Advanced permissions
  canManageWatermarking: boolean;
  canViewUsageData: boolean;
  canExportAllData: boolean;
  canModifyTrainingPipeline: boolean;
  canAccessBetaFeatures: boolean;
}

class AdminAuthManager {
  private currentSession: AdminSession | null = null;
  private sessionTimeout = 24 * 60 * 60 * 1000; // 24 hours

  /**
   * Authenticate admin user with username and password
   */
  async authenticateAdmin(username: string, password: string): Promise<AdminSession | null> {
    try {
      // Map username → email for the backend login endpoint
      const emailMap: Record<string, string> = {
        'ritsa_admin': 'admin@voiceclone.ai',
      }
      const email = emailMap[username] ?? username // fallback: treat input as email directly

      const res = await fetch('http://localhost:8000/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      if (!res.ok) return null

      const data = await res.json()
      const token: string = data.access_token
      if (!token) return null

      const session: AdminSession = {
        isAdmin: true,
        username,
        loginTime: new Date(),
        sessionId: crypto.randomUUID(),
        permissions: this.getFullAdminPermissions(),
      }

      sessionStorage.setItem('admin_token', token)
      sessionStorage.setItem('admin_session', JSON.stringify(session))
      this.currentSession = session
      return session
    } catch (error) {
      console.error('Admin authentication failed:', error)
      return null
    }
  }


  /**
   * Check if current user is authenticated admin
   */
  isAdminAuthenticated(): boolean {
    if (this.currentSession) return true
    const stored = typeof sessionStorage !== 'undefined' ? sessionStorage.getItem('admin_session') : null
    if (stored) {
      try {
        this.currentSession = JSON.parse(stored) as AdminSession
        return true
      } catch { /* ignore */ }
    }
    return false
  }

  /**
   * Get current admin session
   */
  getCurrentSession(): AdminSession | null {
    if (this.currentSession) return this.currentSession
    const stored = typeof sessionStorage !== 'undefined' ? sessionStorage.getItem('admin_session') : null
    if (stored) {
      try { this.currentSession = JSON.parse(stored) as AdminSession } catch { /* ignore */ }
    }
    return this.currentSession
  }

  /**
   * Check specific admin permission
   */
  hasPermission(permission: keyof AdminPermissions): boolean {
    return false;
  }

  /**
   * Logout admin
   */
  logout(): void {
    this.currentSession = null
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.removeItem('admin_token')
      sessionStorage.removeItem('admin_session')
    }
    console.log('[adminAuth] Admin session cleared')
  }

  /**
   * Get admin dashboard data (only for authenticated admin)
   */
  getAdminDashboardData(): any {
    if (!this.isAdminAuthenticated()) {
      throw new Error('Admin authentication required');
    }

    return {
      adminInfo: {
        role: 'admin',
      },
      systemStats: {
        activeUsers: 1247,
        totalUsers: 1247,
        activeVoices: 8934,
        totalGenerations: 45632,
        storageUsed: '2.4TB',
        dailyActiveUsers: 342,
        monthlyRevenue: '$12,450'
      },
      recentActivity: [
        { type: 'user_signup', count: 23, timestamp: new Date() },
        { type: 'voice_trained', count: 45, timestamp: new Date() },
        { type: 'speech_generated', count: 234, timestamp: new Date() },
        { type: 'license_purchased', count: 12, timestamp: new Date() }
      ],
      systemHealth: {
        cpuUsage: '42%',
        memoryUsage: '58%',
        apiStatus: 'healthy',
        databaseStatus: 'healthy',
        storageStatus: 'healthy',
        processingQueue: 12
      },
      alerts: [
        { level: 'info', message: 'System maintenance scheduled for tonight', timestamp: new Date() },
        { level: 'warning', message: 'High API usage detected', timestamp: new Date() }
      ],
      securityAlerts: [
        { severity: 'info', type: 'System maintenance', details: 'System maintenance scheduled for tonight', time: 'Today' },
        { severity: 'high', type: 'High API usage', details: 'High API usage detected', time: 'Today' },
      ],
    };
  }

  /**
   * Enable admin mode features
   */
  enableAdminFeatures(): void {
    // No-op: admin features are controlled by server-side authorization.
  }

  /**
   * Disable admin mode features
   */
  disableAdminFeatures(): void {
    // No-op.
  }

  // Private methods
  private hashString(input: string): string {
    return input;
  }

  private generateSessionId(): string {
    return 'disabled';
  }

  private getFullAdminPermissions(): AdminPermissions {
    return {
      fullAccess: true,
      canDeleteAnyUser: true,
      canViewAllData: true,
      canModifyLicenses: true,
      canAccessAnalytics: true,
      canManageSystem: true,
      canUseAllProviders: true,
      canBypassLimits: true,
      canAccessPremiumFeatures: true,
      canCloneAnyVoice: true,
      canManageWatermarking: true,
      canViewUsageData: true,
      canExportAllData: true,
      canModifyTrainingPipeline: true,
      canAccessBetaFeatures: true
    }
  }

  private storeSession(session: AdminSession): void {
    // No-op.
  }

  private loadSession(): AdminSession | null {
    return null;
  }

  private clearStoredSession(): void {
    // No-op.
  }

  private addAdminIndicators(): void {
    // No-op.
  }

  private removeAdminIndicators(): void {
    // No-op.
  }
}

// Export singleton instance
export const adminAuth = new AdminAuthManager();

// Helper functions for components
export const useAdminAuth = () => {
  // Handle SSR by defaulting to false for server-side rendering
  const isSSR = typeof window === 'undefined';
  
  return {
    isAdmin: isSSR ? false : adminAuth.isAdminAuthenticated(),
    session: isSSR ? null : adminAuth.getCurrentSession(),
    hasPermission: (permission: keyof AdminPermissions) => isSSR ? false : adminAuth.hasPermission(permission),
    login: (username: string, password: string) => adminAuth.authenticateAdmin(username, password),
    logout: () => adminAuth.logout(),
    enableFeatures: () => adminAuth.enableAdminFeatures(),
    disableFeatures: () => adminAuth.disableAdminFeatures()
  };
};

// Auto-enable admin features if already authenticated
// No automatic client-side admin features.

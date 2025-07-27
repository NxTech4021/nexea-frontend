import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

import {
  Card,
  Stack,
  Button,
  Typography,
  CircularProgress,
  Alert,
  Chip,
  Box,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Collapse,
  Link,
} from '@mui/material';

import { axiosInstance } from 'src/utils/axios';

import Iconify from 'src/components/iconify';

const QuickBooksIntegration = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [companyId, setCompanyId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(true);
  const [authUrl, setAuthUrl] = useState('');
  const [showManualFlow, setShowManualFlow] = useState(false);
  const [manualCode, setManualCode] = useState('');
  const [manualRealmId, setManualRealmId] = useState('');
  const [tokenInfo, setTokenInfo] = useState(null);
  const [showTokenInfo, setShowTokenInfo] = useState(false);

  // Check QuickBooks connection status on component mount
  useEffect(() => {
    checkConnectionStatus();
  }, []);

  const checkConnectionStatus = async () => {
    try {
      setCheckingStatus(true);
      const response = await axiosInstance.get('/quickbooks/status');
      setIsConnected(response.data.connected);
      setCompanyId(response.data.companyId);
    } catch (error) {
      console.error('Error checking QuickBooks status:', error);
      setIsConnected(false);
    } finally {
      setCheckingStatus(false);
    }
  };

  const handleConnect = async () => {
    try {
      setLoading(true);
      
      // Get the auth URL from backend
      const response = await axiosInstance.get('/quickbooks/auth-url');
      
      if (response.data.success) {
        // Open popup window for OAuth
        const popup = window.open(
          response.data.authUrl,
          'quickbooks-oauth',
          'width=600,height=700,scrollbars=yes'
        );

        // Listen for message from popup
        const messageListener = (event) => {
          // Ensure message is from the popup
          if (event.source === popup && event.data.type === 'QUICKBOOKS_CONNECTED') {
            console.log('✅ Received QuickBooks connection success message:', event.data);
            
            // Clean up
            window.removeEventListener('message', messageListener);
            
            if (event.data.success) {
              toast.success('Successfully connected to QuickBooks!');
              setIsConnected(true);
              setCompanyId(event.data.realmId);
              
              // Refresh status after a short delay
              setTimeout(() => {
                checkConnectionStatus();
              }, 1000);
            } else {
              toast.error('QuickBooks connection failed');
            }
          }
        };

        // Add message listener
        window.addEventListener('message', messageListener);

        // Also listen for the popup to close (fallback)
        const checkClosed = setInterval(() => {
          if (popup.closed) {
            clearInterval(checkClosed);
            window.removeEventListener('message', messageListener);
            
            // Check connection status after popup closes (fallback)
            setTimeout(() => {
              checkConnectionStatus();
            }, 1000);
          }
        }, 1000);

        toast.info('Please complete authorization in the popup window', {
          autoClose: 5000,
        });
      } else {
        throw new Error(response.data.error || 'Failed to get auth URL');
      }
      
    } catch (error) {
      console.error('Error getting auth URL:', error);
      toast.error('Failed to get QuickBooks authorization URL');
    } finally {
      setLoading(false);
    }
  };

  const handleManualConnect = async () => {
    if (!manualCode || !manualRealmId) {
      toast.error('Please provide both authorization code and realm ID');
      return;
    }

    try {
      setLoading(true);
      
      const response = await axiosInstance.post('/quickbooks/exchange-token', {
        code: manualCode,
        realmId: manualRealmId
      });

      if (response.data.success) {
        toast.success('Successfully connected to QuickBooks!');
        setIsConnected(true);
        setCompanyId(response.data.realmId);
        setShowManualFlow(false);
        setManualCode('');
        setManualRealmId('');
        checkConnectionStatus(); // Refresh status
      } else {
        throw new Error(response.data.error || 'Token exchange failed');
      }
    } catch (error) {
      console.error('Error exchanging token:', error);
      toast.error(error.response?.data?.error || 'Failed to connect to QuickBooks');
    } finally {
      setLoading(false);
    }
  };

  const handleRefreshTokens = async () => {
    try {
      setLoading(true);
      
      const response = await axiosInstance.post('/quickbooks/refresh-tokens');
      
      if (response.data.success) {
        toast.success('Tokens refreshed successfully!');
        checkConnectionStatus(); // Refresh status
      } else {
        throw new Error(response.data.error || 'Token refresh failed');
      }
    } catch (error) {
      console.error('Error refreshing tokens:', error);
      
      // If no QuickBooks settings found, suggest connecting first
      if (error.response?.data?.error?.includes('No QuickBooks settings found')) {
        toast.error('No QuickBooks connection found. Please connect first using the Connect button.');
        setIsConnected(false);
      } else {
        toast.error(error.response?.data?.error || 'Failed to refresh tokens');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchTokenInfo = async () => {
    try {
      const response = await axiosInstance.get('/quickbooks/token-info');
      setTokenInfo(response.data);
      setShowTokenInfo(true);
    } catch (error) {
      console.error('Error fetching token info:', error);
      toast.error('Failed to fetch token information');
    }
  };

  // Smart connect function that tries refresh first, then connects if needed
  const handleSmartConnect = async () => {
    try {
      setLoading(true);
      
      // First try to refresh tokens if they exist
      try {
        const refreshResponse = await axiosInstance.post('/quickbooks/refresh-tokens');
        if (refreshResponse.data.success) {
          toast.success('Successfully refreshed existing QuickBooks connection!');
          checkConnectionStatus();
          return;
        }
      } catch (refreshError) {
        // If refresh fails, proceed to new connection
        console.log('Refresh failed, proceeding to new connection...');
      }
      
      // If refresh failed, start new connection flow
      await handleConnect();
      
    } catch (error) {
      console.error('Error in smart connect:', error);
      toast.error('Failed to connect to QuickBooks');
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      setLoading(true);
      await axiosInstance.post('/quickbooks/disconnect');
      setIsConnected(false);
      setCompanyId(null);
      toast.success('Successfully disconnected from QuickBooks');
    } catch (error) {
      console.error('Error disconnecting from QuickBooks:', error);
      toast.error('Failed to disconnect from QuickBooks');
    } finally {
      setLoading(false);
    }
  };

  const handleTestConnection = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/quickbooks/test-connection');
      
      if (response.data.success) {
        toast.success(`QuickBooks connection successful! Connected to: ${response.data.companyInfo.name}`);
        console.log('✅ QuickBooks connection details:', response.data);
      } else {
        toast.error(`QuickBooks connection failed: ${response.data.error}`);
        console.error('❌ QuickBooks connection failed:', response.data);
        
        // If token expired, suggest reconnection
        if (response.data.tokenExpired) {
          toast.info('Your QuickBooks token has expired. Please reconnect.');
        }
      }
    } catch (error) {
      console.error('Error testing QuickBooks connection:', error);
      
      // Handle different error scenarios
      if (error.response?.status === 400) {
        const errorData = error.response.data;
        toast.error(`Connection test failed: ${errorData.error}`);
        
        if (errorData.tokenExpired) {
          toast.info('Your QuickBooks token has expired. Please reconnect.');
        }
      } else if (error.response?.status === 500) {
        toast.error('Server error while testing connection. Please try again.');
      } else {
        toast.error('QuickBooks connection test failed. Please check your connection.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (checkingStatus) {
    return (
      <Card sx={{ p: 3 }}>
        <Stack alignItems="center" spacing={2}>
          <CircularProgress />
          <Typography>Checking QuickBooks connection...</Typography>
        </Stack>
      </Card>
    );
  }

  return (
    <Card sx={{ p: 3 }}>
      <Stack spacing={3}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Iconify icon="logos:quickbooks" width={32} />
          <Typography variant="h6">QuickBooks Integration</Typography>
          <Chip
            label={isConnected ? 'Connected' : 'Disconnected'}
            color={isConnected ? 'success' : 'error'}
            variant="outlined"
          />
        </Box>

        {/* Status Information */}
        {isConnected ? (
          <Alert severity="success" sx={{ mb: 2 }}>
            <Typography variant="body2">
              Successfully connected to QuickBooks!
              {companyId && (
                <>
                  <br />
                  <strong>Company ID:</strong> {companyId}
                </>
              )}
            </Typography>
          </Alert>
        ) : (
          <Alert severity="warning" sx={{ mb: 2 }}>
            <Typography variant="body2">
              QuickBooks is not connected. Connect to enable automatic invoice generation for orders.
            </Typography>
          </Alert>
        )}

        {/* Description */}
        <Typography variant="body2" color="text.secondary">
          Connect your QuickBooks account to automatically generate and send invoices for event registrations. 
          Tokens are securely stored in the database and automatically refreshed when needed.
        </Typography>

        {/* Action Buttons */}
        <Stack 
          direction={{ xs: 'column', sm: 'row' }} 
          spacing={2} 
          sx={{ 
            mt: 3,
            '& .MuiButton-root': {
              minWidth: { xs: '100%', sm: 'auto' }
            }
          }}
        >
          {!isConnected ? (
            <Button
              variant="contained"
              startIcon={<Iconify icon="eva:link-2-fill" />}
              onClick={handleConnect}
              disabled={loading}
              sx={{
                bgcolor: '#2E7BE0',
                '&:hover': { bgcolor: '#1B5FB3' }
              }}
            >
              {loading ? <CircularProgress size={20} /> : 'Connect to QuickBooks'}
            </Button>
          ) : (
            <>
              <Button
                variant="outlined"
                color="error"
                startIcon={<Iconify icon="eva:unlink-fill" />}
                onClick={handleDisconnect}
                disabled={loading}
              >
                {loading ? <CircularProgress size={20} /> : 'Disconnect'}
              </Button>
              <Button
                variant="outlined"
                startIcon={<Iconify icon="eva:refresh-fill" />}
                onClick={handleRefreshTokens}
                disabled={loading}
              >
                {loading ? <CircularProgress size={20} /> : 'Refresh Tokens'}
              </Button>
              <Button
                variant="outlined"
                startIcon={<Iconify icon="eva:checkmark-circle-2-fill" />}
                onClick={handleTestConnection}
                disabled={loading}
              >
                {loading ? <CircularProgress size={20} /> : 'Test Connection'}
              </Button>
              <Button
                variant="outlined"
                startIcon={<Iconify icon="eva:info-fill" />}
                onClick={fetchTokenInfo}
                disabled={loading}
                size="small"
              >
                View Token Info
              </Button>
            </>
          )}
        </Stack>

        {/* Manual Authorization Flow */}
        <Collapse in={showManualFlow}>
          <Card sx={{ p: 2, mt: 2, bgcolor: 'grey.50' }}>
            <Typography variant="h6" gutterBottom>
              Complete Authorization
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              After authorizing in the new tab, copy the <strong>code</strong> and <strong>realmId</strong> from the callback URL and paste them below:
            </Typography>
            
            <Stack spacing={2}>
              <TextField
                fullWidth
                label="Authorization Code"
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                placeholder="e.g., XAB11753639114SAuSmgbxc42xg6ti3fzASsjVKx5h4w1TYPuB"
                size="small"
              />
              <TextField
                fullWidth
                label="Realm ID (Company ID)"
                value={manualRealmId}
                onChange={(e) => setManualRealmId(e.target.value)}
                placeholder="e.g., 9341455044011373"
                size="small"
              />
              <Stack direction="row" spacing={2}>
                <Button
                  variant="contained"
                  onClick={handleManualConnect}
                  disabled={loading || !manualCode || !manualRealmId}
                  size="small"
                >
                  {loading ? <CircularProgress size={16} /> : 'Connect'}
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => setShowManualFlow(false)}
                  size="small"
                >
                  Cancel
                </Button>
              </Stack>
            </Stack>
            
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
              The callback URL format: https://developer.intuit.com/v2/OAuth2Playground/RedirectUrl?code=<strong>CODE</strong>&realmId=<strong>REALM_ID</strong>
            </Typography>
          </Card>
        </Collapse>

        {/* Additional Info */}
        <Typography variant="caption" color="text.secondary" sx={{ mt: 2 }}>
          Note: This integration uses secure OAuth2 authentication and stores tokens in the database 
          instead of environment variables for better security and automatic token refresh.
        </Typography>
      </Stack>

      {/* Token Information Dialog */}
      <Dialog 
        open={showTokenInfo} 
        onClose={() => setShowTokenInfo(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Iconify icon="eva:info-fill" />
            <Typography>QuickBooks Token Information</Typography>
          </Stack>
        </DialogTitle>
        <DialogContent>
          {tokenInfo && (
            <Stack spacing={2}>
              <Alert severity="warning">
                {tokenInfo.warning}
              </Alert>
              
              <Box sx={{ bgcolor: 'grey.50', p: 2, borderRadius: 1 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Connection Status
                </Typography>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Chip 
                    label={tokenInfo.connected ? 'Connected' : 'Not Connected'} 
                    color={tokenInfo.connected ? 'success' : 'error'}
                    size="small"
                  />
                  <Chip 
                    label={`Source: ${tokenInfo.source}`} 
                    color={tokenInfo.source === 'database' ? 'primary' : 'warning'}
                    size="small"
                  />
                </Stack>
              </Box>

              {tokenInfo.tokenInfo && (
                <Box sx={{ bgcolor: 'grey.50', p: 2, borderRadius: 1 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Token Details
                  </Typography>
                  <Stack spacing={1}>
                    <Typography variant="body2">
                      <strong>Company ID:</strong> {tokenInfo.tokenInfo.realmId}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Access Token:</strong> <code>{tokenInfo.tokenInfo.accessToken}</code>
                    </Typography>
                    <Typography variant="body2">
                      <strong>Refresh Token:</strong> <code>{tokenInfo.tokenInfo.refreshToken}</code>
                    </Typography>
                    <Typography variant="body2">
                      <strong>Expires At:</strong> {tokenInfo.tokenInfo.accessTokenExpiry}
                    </Typography>
                    {tokenInfo.tokenInfo.isExpired !== undefined && (
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Typography variant="body2">
                          <strong>Status:</strong>
                        </Typography>
                        <Chip 
                          label={tokenInfo.tokenInfo.isExpired ? 'EXPIRED' : 'Valid'} 
                          color={tokenInfo.tokenInfo.isExpired ? 'error' : 'success'}
                          size="small"
                        />
                        {!tokenInfo.tokenInfo.isExpired && tokenInfo.tokenInfo.expiresInMinutes && (
                          <Typography variant="body2" color="text.secondary">
                            (Expires in {tokenInfo.tokenInfo.expiresInMinutes} minutes)
                          </Typography>
                        )}
                      </Stack>
                    )}
                    {tokenInfo.tokenInfo.createdAt && (
                      <Typography variant="body2">
                        <strong>Created:</strong> {new Date(tokenInfo.tokenInfo.createdAt).toLocaleString()}
                      </Typography>
                    )}
                    {tokenInfo.tokenInfo.updatedAt && (
                      <Typography variant="body2">
                        <strong>Updated:</strong> {new Date(tokenInfo.tokenInfo.updatedAt).toLocaleString()}
                      </Typography>
                    )}
                  </Stack>
                </Box>
              )}
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowTokenInfo(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
};

export default QuickBooksIntegration;

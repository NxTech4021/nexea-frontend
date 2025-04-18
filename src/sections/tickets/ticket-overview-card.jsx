import { toast } from 'sonner';
import React, { useMemo, useState } from 'react';
import { useFormContext } from 'react-hook-form';

import { LoadingButton } from '@mui/lab';
import {
  Box,
  Card,
  alpha,
  Stack,
  Button,
  Divider,
  Collapse,
  TextField,
  Typography,
  IconButton,
} from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';
import { useResponsive } from 'src/hooks/use-responsive';

import { useCartStore } from 'src/utils/store';
import axiosInstance, { endpoints } from 'src/utils/axios';

import Iconify from 'src/components/iconify';

import useGetCartData from './hooks/use-get-cart';

const shortenString = (text, length) => {
  if (text.length > length) {
    return `${text.slice(0, length)}...`;
  }
  return text;
};

const TicketOverviewCard = () => {
  const { tickets } = useCartStore();
  const [discountCode, setDiscountCode] = useState(null);
  const mdDown = useResponsive('down', 'md');
  const { data: cartData, cartMutate, handleCheckout } = useGetCartData();
  const collapse = useBoolean(true); // Default to open in mobile view

  const {
    formState: { isSubmitting },
  } = useFormContext();

  const subTotal = useMemo(
    () =>
      tickets.reduce((acc, cur) => acc + cur.subTotal, 0) ||
      cartData?.orderSummary?.subtotal,
    [tickets, cartData]
  );

  const totalTicketsQuantitySelected = useMemo(() => {
    const ticketsTotal = tickets.reduce((acc, cur) => acc + cur.selectedQuantity, 0);
    return ticketsTotal;
  }, [tickets]);

  const handleRedeemDiscount = async () => {
    if (!discountCode) {
      toast.error('Please enter a discount code');
      return;
    }

    try {
      const res = await axiosInstance.post('/api/cart/redeemDiscountCode', { discountCode });
      toast.success(res?.data?.message);
      cartMutate();
    } catch (error) {
      toast.error(error);
    }
  };

  const removeDiscountCode = async () => {
    try {
      const res = await axiosInstance.patch(endpoints.discount.remove);
      cartMutate();
      toast.success(res?.data?.message);
    } catch (error) {
      toast.error(error?.message || 'Error removing code');
    }
  };

  if (mdDown) {
    return (
      <Card
        elevation={2}
        sx={{
          position: 'sticky',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 10,
          borderRadius: '16px 16px 0 0',
          overflow: 'hidden',
          borderTop: 1,
          borderColor: 'divider',
          boxShadow: '0 -4px 20px rgba(0,0,0,0.08)',
          pb: 2,
        }}
      >
        <Collapse in={collapse.value} timeout="auto">
          <Box 
            sx={{ 
              maxHeight: '50vh', 
              overflowY: 'auto',
              p: 2.5,
              pb: 1.5,
              '&::-webkit-scrollbar': {
                width: '6px',
              },
              '&::-webkit-scrollbar-thumb': {
                background: (theme) => alpha(theme.palette.text.primary, 0.2),
                borderRadius: '10px',
              },
            }} 
          >
            {!totalTicketsQuantitySelected ? (
              <Stack 
                direction="row" 
                spacing={1.5} 
                alignItems="center" 
                justifyContent="center"
                sx={{
                  py: 4,
                  px: 2,
                  borderRadius: 2,
                  bgcolor: (theme) => alpha(theme.palette.grey[200], 0.5),
                }}
              >
                <Iconify icon="solar:cart-large-minimalistic-outline" width={24} color="text.secondary" />
                <Typography color="text.secondary" fontWeight={500}>
                  No tickets selected
                </Typography>
              </Stack>
            ) : (
              <Stack spacing={2.5}>
                <Typography variant="h6">
                  Order Summary
                </Typography>
                
                <Card
                  elevation={0}
                  sx={{ 
                    p: 2, 
                    borderRadius: 1, 
                    bgcolor: (theme) => alpha(theme.palette.background.neutral, 0.6),
                    border: '1px solid',
                    borderColor: 'divider',
                  }}
                >
                  <Stack spacing={2}>
                    {tickets
                      .filter((ticket) => ticket.selectedQuantity > 0)
                      .map((ticket) => (
                        <Stack
                          key={ticket.id}
                          direction="row"
                          alignItems="center"
                          justifyContent="space-between"
                        >
                          <Stack direction="row" alignItems="center" spacing={1}>
                            <Iconify icon="mdi:ticket-outline" width={16} />
                            <Typography sx={{ fontWeight: 500 }}>{`${ticket.selectedQuantity} × ${ticket.title}`}</Typography>
                          </Stack>
                          <Typography sx={{ fontWeight: 600 }}>
                            {Intl.NumberFormat('en-MY', {
                              style: 'currency',
                              currency: 'MYR',
                            }).format(ticket.subTotal)}
                          </Typography>
                        </Stack>
                      ))}
                  </Stack>
                </Card>

                <Card
                  elevation={0}
                  sx={{ 
                    p: 2, 
                    borderRadius: 1,
                    border: '1px solid',
                    borderColor: 'divider',
                  }}
                >
                  <Stack spacing={2}>
                    <Stack
                      direction="row"
                      alignItems="center"
                      justifyContent="space-between"
                    >
                      <Typography color="text.secondary">SST:</Typography>
                      <Typography fontWeight={500}>
                        {Intl.NumberFormat('en-MY', {
                          style: 'currency',
                          currency: 'MYR',
                        }).format(0.1)}
                      </Typography>
                    </Stack>
                    
                    <Divider />
                    
                    <Stack
                      direction="row"
                      alignItems="center"
                      justifyContent="space-between"
                    >
                      <Typography variant="subtitle1">Total:</Typography>
                      <Typography variant="h6" color="grey.800">
                        {Intl.NumberFormat('en-MY', {
                          style: 'currency',
                          currency: 'MYR',
                        }).format(subTotal && subTotal + 0.1)}
                      </Typography>
                    </Stack>
                  </Stack>
                </Card>
              </Stack>
            )}
          </Box>
        </Collapse>

        <Box 
          onClick={() => collapse.onToggle()}
          sx={{ 
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer',
            mx: 2.5,
            my: 1.5,
            p: 1.5,
            borderRadius: 2,
            bgcolor: (theme) => alpha(theme.palette.grey[200], 0.5),
            '&:hover': {
              bgcolor: (theme) => alpha(theme.palette.grey[300], 0.5),
            }
          }}
        >
          <Typography variant="subtitle1">
            {collapse.value ? 'Hide Order Summary' : 'View Order Summary'}
          </Typography>
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Typography
              variant="subtitle1"
              fontWeight={600}
              color="grey.800"
            >
              {Intl.NumberFormat('en-MY', { style: 'currency', currency: 'MYR' }).format(
                (subTotal && subTotal + 0.1) || 0
              )}
            </Typography>
            <Iconify 
              icon={collapse.value ? "iconamoon:arrow-up-2-bold" : "iconamoon:arrow-down-2-bold"} 
              width={20}
              sx={{ 
                transition: 'transform 0.2s ease',
                transform: collapse.value ? 'rotate(0deg)' : 'rotate(0deg)'
              }}
            />
          </Stack>
        </Box>

        <Box sx={{ px: 2.5 }}>
          {cartData ? (
            <LoadingButton
              variant="contained"
              fullWidth
              size="large"
              startIcon={<Iconify icon="fluent:payment-16-filled" width={20} />}
              sx={{
                borderRadius: 2,
                py: 1.5,
                bgcolor: 'grey.800',
                '&:hover': {
                  bgcolor: 'grey.900',
                  transform: 'translateY(-2px)',
                },
                transition: 'all 0.2s',
              }}
            >
              Proceed to payment
            </LoadingButton>
          ) : (
            <LoadingButton
              variant="contained"
              size="large"
              fullWidth
              onClick={handleCheckout}
              startIcon={
                <Iconify icon="material-symbols-light:shopping-cart-checkout-rounded" width={22} />
              }
              sx={{
                borderRadius: 2,
                py: 1.5,
                bgcolor: 'grey.800',
                '&:hover': {
                  bgcolor: 'grey.900',
                  transform: 'translateY(-2px)',
                },
                transition: 'all 0.2s',
              }}
            >
              Check Out
            </LoadingButton>
          )}
        </Box>
      </Card>
    );
  }

  return (
    <Card
      elevation={0}
      sx={{
        height: 1, 
        borderRadius: 0,
        border: '1px solid',
        borderColor: 'divider',
        overflow: 'hidden',
      }}
    >
      <Box sx={{ bgcolor: '#000000', p: 2.5 }}>
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Typography variant="h6" color="common.white">Order Summary</Typography>
        </Stack>
      </Box>

      {subTotal || cartData ? (
        <Stack
          sx={{
            p: 2.5,
            flex: 1,
            height: 'calc(100% - 68px)',
            overflowY: 'auto',
            '&::-webkit-scrollbar': {
              width: '6px',
            },
            '&::-webkit-scrollbar-thumb': {
              background: (theme) => alpha(theme.palette.text.primary, 0.2),
              borderRadius: '10px',
            },
          }}
        >
          <Stack
            spacing={3}
            sx={{ mb: 3 }}
          >
            <Card
              elevation={0}
              sx={{ 
                p: 2, 
                borderRadius: 1, 
                bgcolor: (theme) => alpha(theme.palette.background.neutral, 0.6),
                border: '1px solid',
                borderColor: 'divider',
              }}
            >
              <Stack spacing={2.5}>
                {cartData
                  ? cartData.cartItem.map((item) => (
                    <Stack key={item.id}>
                      <Stack direction="row" alignItems="center" justifyContent="space-between">
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <Iconify icon="mdi:ticket-outline" width={16} />
                          <Typography sx={{ fontWeight: 500 }}>
                            {`${item.quantity} × ${item.ticketType.title}`}
                          </Typography>
                        </Stack>
                        <Typography sx={{ fontWeight: 600 }}>
                          {Intl.NumberFormat('en-MY', {
                            style: 'currency',
                            currency: 'MYR',
                          }).format(item.quantity * item.ticketType.price)}
                        </Typography>
                      </Stack>
                      {item?.cartAddOn?.some((a) => a?.quantity > 0) && (
                        <Stack
                          ml={4}
                          mt={1}
                          spacing={1}
                          sx={{
                            p: 1.5,
                            borderRadius: 1.5,
                            bgcolor: (theme) => alpha(theme.palette.background.neutral, 0.5),
                          }}
                        >
                          <Typography 
                            variant="caption" 
                            sx={{ 
                              fontWeight: 600,
                              color: 'text.secondary',
                              fontSize: '0.75rem'
                            }}
                          >
                            Add Ons:
                          </Typography>
                          {item?.cartAddOn?.map((a) => (
                            <Stack
                              key={a.id}
                              direction="row"
                              alignItems="center"
                              justifyContent="space-between"
                              sx={{ pl: 1 }}
                            >
                              <Stack direction="row" alignItems="center" spacing={1}>
                                <Iconify icon="mdi:plus-circle-outline" width={14} />
                                <Typography variant="caption" sx={{ fontSize: '0.8rem' }}>
                                  {`${a.quantity} × ${a.addOn.name}`}
                                </Typography>
                              </Stack>
                              <Typography variant="caption" sx={{ fontWeight: 600, fontSize: '0.8rem' }}>
                                {Intl.NumberFormat('en-MY', {
                                  style: 'currency',
                                  currency: 'MYR',
                                }).format(a.quantity * a.addOn.price)}
                              </Typography>
                            </Stack>
                          ))}
                        </Stack>
                      )}
                    </Stack>
                  ))
                  : tickets
                    .filter((ticket) => ticket.selectedQuantity > 0)
                    .map((ticket) => (
                      <Stack key={ticket.id}>
                        <Stack direction="row" alignItems="center" justifyContent="space-between">
                          <Stack direction="row" alignItems="center" spacing={1}>
                            <Iconify icon="mdi:ticket-outline" width={16} />
                            <Typography sx={{ fontWeight: 500 }}>
                              {`${ticket.selectedQuantity} × ${ticket.title}`}
                            </Typography>
                          </Stack>
                          <Typography sx={{ fontWeight: 600 }}>
                            {Intl.NumberFormat('en-MY', {
                              style: 'currency',
                              currency: 'MYR',
                            }).format(ticket.subTotal)}
                          </Typography>
                        </Stack>
                        {ticket?.addOns?.some((a) => a?.selectedQuantity > 0) && (
                          <Stack
                            ml={4}
                            mt={1}
                            spacing={1}
                            sx={{
                              p: 1.5,
                              borderRadius: 1.5,
                              bgcolor: (theme) => alpha(theme.palette.background.neutral, 0.5),
                            }}
                          >
                            <Typography 
                              variant="caption" 
                              sx={{ 
                                fontWeight: 600,
                                color: 'text.secondary',
                                fontSize: '0.75rem'
                              }}
                            >
                              Add Ons:
                            </Typography>
                            {ticket?.addOns
                              ?.filter((a) => a.selectedQuantity > 0)
                              ?.map((item) => (
                                <Stack
                                  key={item.id}
                                  direction="row"
                                  alignItems="center"
                                  justifyContent="space-between"
                                  sx={{ pl: 1 }}
                                >
                                  <Stack direction="row" alignItems="center" spacing={1}>
                                    <Iconify icon="mdi:plus-circle-outline" width={14} />
                                    <Typography variant="caption" sx={{ fontSize: '0.8rem' }}>
                                      {`${item.selectedQuantity} × ${item.name}`}
                                    </Typography>
                                  </Stack>
                                  <Typography variant="caption" sx={{ fontWeight: 600, fontSize: '0.8rem' }}>
                                    {Intl.NumberFormat('en-MY', {
                                      style: 'currency',
                                      currency: 'MYR',
                                    }).format(item.selectedQuantity * item.price)}
                                  </Typography>
                                </Stack>
                              ))}
                          </Stack>
                        )}
                      </Stack>
                    ))}
              </Stack>
            </Card>

            {cartData && (
              <Card
                elevation={0}
                sx={{ 
                  p: 2, 
                  borderRadius: 1,
                  border: '1px solid',
                  borderColor: 'divider',
                }}
              >
                <Stack spacing={1.5}>
                  <Typography variant="subtitle2" mb={0.5}>Discount Code</Typography>
                  <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                    spacing={1}
                  >
                    <TextField
                      size="small"
                      fullWidth
                      placeholder="Enter Discount Code"
                      value={discountCode}
                      onChange={(e) =>
                        setDiscountCode(e.target.value.toUpperCase().split(' ').join(''))
                      }
                      InputProps={{
                        sx: { borderRadius: 1.5 }
                      }}
                    />
                    <Button
                      variant="contained"
                      size="medium"
                      onClick={handleRedeemDiscount}
                      sx={{ 
                        height: 40,
                        borderRadius: 1.5,
                        px: 2,
                        bgcolor: 'grey.800',
                        '&:hover': {
                          bgcolor: 'grey.900',
                        }
                      }}
                    >
                      Apply
                    </Button>
                  </Stack>

                  {!!cartData.discount && (
                    <Stack spacing={1} sx={{ mt: 1 }}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Iconify
                          icon="lets-icons:check-fill"
                          color="success.main"
                          width={16}
                        />
                        <Typography variant="body2" color="success.main" fontWeight={500}>
                          Discount code applied
                        </Typography>
                      </Stack>
                      <Stack 
                        direction="row" 
                        justifyContent="space-between"
                        alignItems="center"
                        sx={{
                          p: 1.5,
                          borderRadius: 1.5,
                          bgcolor: (theme) => alpha(theme.palette.success.lighter, 0.5),
                        }}
                      >
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <Typography variant="body2" fontWeight={500}>
                            {cartData.discount.code}
                          </Typography>
                          <IconButton 
                            size="small" 
                            onClick={removeDiscountCode}
                            sx={{
                              bgcolor: (theme) => alpha(theme.palette.error.main, 0.1),
                              '&:hover': {
                                bgcolor: (theme) => alpha(theme.palette.error.main, 0.2),
                              }
                            }}
                          >
                            <Iconify icon="mdi:trash-outline" width={14} color="error.main" />
                          </IconButton>
                        </Stack>
                        <Typography variant="body2" color="error.main" fontWeight={600}>
                          - {cartData.discount.value}
                        </Typography>
                      </Stack>
                    </Stack>
                  )}
                </Stack>
              </Card>
            )}

            <Card
              elevation={0}
              sx={{ 
                p: 2, 
                borderRadius: 1,
                border: '1px solid',
                borderColor: 'divider',
              }}
            >
              <Stack spacing={2}>
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                  <Typography color="text.secondary">Subtotal:</Typography>
                  <Typography fontWeight={500}>
                    {Intl.NumberFormat('en-MY', { style: 'currency', currency: 'MYR' }).format(
                      subTotal || cartData?.orderSummary?.subtotal || 0
                    )}
                  </Typography>
                </Stack>

                {cartData && cartData?.orderSummary?.discount > 0 && (
                  <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Typography color="text.secondary">Discount:</Typography>
                    <Typography fontWeight={500} color="error.main">
                      - {Intl.NumberFormat('en-MY', { style: 'currency', currency: 'MYR' }).format(
                        cartData.orderSummary.discount
                      )}
                    </Typography>
                  </Stack>
                )}

                {(subTotal > 0 || (cartData?.orderSummary?.subtotal || 0) > 0) && (
                  <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Typography color="text.secondary">SST:</Typography>
                    <Typography fontWeight={500}>
                      {Intl.NumberFormat('en-MY', {
                        style: 'currency',
                        currency: 'MYR',
                      }).format(0.1)}
                    </Typography>
                  </Stack>
                )}
                
                <Divider />
                
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                  <Typography variant="subtitle1">Total:</Typography>
                  <Typography variant="h6" color="grey.800">
                    {Intl.NumberFormat('en-MY', { style: 'currency', currency: 'MYR' }).format(
                      cartData?.orderSummary?.totalPrice
                        ? cartData.orderSummary.totalPrice +
                          (cartData.orderSummary.subtotal > 0 ? 0.1 : 0)
                        : subTotal + (subTotal > 0 ? 0.1 : 0)
                    )}
                  </Typography>
                </Stack>
              </Stack>
            </Card>
            
            {cartData ? (
              <LoadingButton
                variant="contained"
                size="large"
                startIcon={<Iconify icon="fluent:payment-16-filled" width={20} />}
                type="submit"
                loading={isSubmitting}
                disabled={!cartData?.cartItem?.length}
                sx={{
                  borderRadius: 1,
                  py: 1.5,
                  bgcolor: 'grey.800',
                  '&:hover': {
                    bgcolor: 'grey.900',
                    transform: 'translateY(-2px)',
                  },
                  transition: 'all 0.2s',
                }}
              >
                Proceed to Payment
              </LoadingButton>
            ) : (
              <LoadingButton
                variant="contained"
                size="large"
                fullWidth
                onClick={handleCheckout}
                startIcon={<Iconify icon="material-symbols-light:shopping-cart-checkout-rounded" width={22} />}
                disabled={!totalTicketsQuantitySelected}
                sx={{
                  py: 1.5,
                  bgcolor: 'grey.800',
                  '&:hover': {
                    bgcolor: 'grey.900',
                    transform: 'translateY(-2px)',
                  },
                  transition: 'all 0.2s',
                }}
              >
                Check Out
              </LoadingButton>
            )}
          </Stack>
        </Stack>
      ) : (
        <Stack 
          alignItems="center" 
          justifyContent="center" 
          spacing={2}
          sx={{ 
            height: 'calc(100% - 68px)',
            p: 4
          }}
        >
          <Iconify 
            icon="solar:cart-large-minimalistic-broken" 
            width={60} 
            sx={{ 
              color: (theme) => alpha(theme.palette.text.primary, 0.2),
              mb: 1
            }} 
          />
          <Typography variant="h6" color="text.secondary" align="center">
            Your cart is empty
          </Typography>
          <Typography variant="body2" color="text.secondary" align="center">
            Add some tickets to get started!
          </Typography>
        </Stack>
      )}
    </Card>
  );
};

export default TicketOverviewCard;

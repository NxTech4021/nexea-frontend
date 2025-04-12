import { toast } from 'sonner';
import { useFormContext } from 'react-hook-form';
import React, { useMemo, useState, useEffect } from 'react';

import { LoadingButton } from '@mui/lab';
import { grey } from '@mui/material/colors';
import {
  Box,
  Card,
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
  const { data: cartData, cartMutate, handleCheckout, eventData } = useGetCartData();
  const collapse = useBoolean();
  const [calculatedSST, setCalculatedSST] = useState(null);

  const {
    formState: { isSubmitting },
  } = useFormContext();

  const subTotal = useMemo(
    () =>
      tickets.reduce((acc, cur) => acc + cur.subTotal, 0) ||
      // cartData?.cartItem?.reduce((acc, sum) => acc + sum.quantity * sum.ticketType.price, 0),
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

  useEffect(() => {
    const sst = eventData?.sst || null;

    const sstPrice = parseFloat(((subTotal * sst) / 100).toFixed(2));
    setCalculatedSST(sstPrice);
  }, [eventData, subTotal]);

  if (mdDown) {
    return (
      <Box
        component={Card}
        p={1}
        boxShadow={10}
        minHeight={100}
        sx={{
          ...(mdDown && {
            borderTop: 1.5,
            boxShadow: 2,
            borderColor: (theme) => theme.palette.divider,
            borderRadius: '10px 10px 0 0',
          }),
        }}
      >
        <Collapse in={collapse.value} timeout="auto">
          <Box sx={{ height: '30vh', p: 1 }} position="relative">
            {!totalTicketsQuantitySelected ? (
              <Typography
                sx={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                }}
                color="text.secondary"
              >
                No tickets selected
              </Typography>
            ) : (
              <Stack height={1}>
                <Typography mb={2} variant="subtitle2">
                  Order Summary
                </Typography>
                <Stack
                  spacing={1}
                  flexGrow={1}
                  sx={{
                    '& .MuiTypography-root': {
                      fontSize: 16,
                      fontWeight: 500,
                    },
                  }}
                >
                  {tickets
                    .filter((ticket) => ticket.selectedQuantity > 0)
                    .map((ticket) => (
                      <Stack
                        key={ticket.id}
                        direction="row"
                        alignItems="center"
                        justifyContent="space-between"
                        // "&"
                      >
                        <Typography>{`${ticket.selectedQuantity} x ${ticket.title}`}</Typography>
                        <Typography>
                          {Intl.NumberFormat('en-MY', {
                            style: 'currency',
                            currency: 'MYR',
                          }).format(ticket.subTotal)}
                        </Typography>
                      </Stack>
                    ))}
                </Stack>
                <Stack spacing={2}>
                  <Stack
                    direction="row"
                    alignItems="center"
                    gap={10}
                    justifyContent="space-between"
                    sx={{
                      '& .MuiTypography-root': {
                        fontSize: 16,
                        fontWeight: 500,
                      },
                    }}
                  >
                    <Typography>SST:</Typography>
                    <Typography>
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
                    gap={10}
                    justifyContent="space-between"
                    sx={{
                      '&  .MuiTypography-root': {
                        fontSize: 20,
                        fontWeight: 600,
                      },
                    }}
                  >
                    <Typography>Total:</Typography>
                    <Typography>
                      {Intl.NumberFormat('en-MY', {
                        style: 'currency',
                        currency: 'MYR',
                      }).format(subTotal && subTotal + calculatedSST)}
                    </Typography>
                  </Stack>
                </Stack>
              </Stack>
            )}
          </Box>
        </Collapse>

        <Box my={1} onClick={() => collapse.onToggle()}>
          <Stack direction="row" alignItems="center" justifyContent="end" spacing={2}>
            {collapse.value ? (
              <Iconify icon="iconamoon:arrow-up-2-bold" width={24} />
            ) : (
              <Iconify icon="iconamoon:arrow-down-2-bold" width={24} />
            )}
            <Typography
              variant="subtitle1"
              textAlign="end"
              fontSize={18}
              fontWeight={600}
              letterSpacing={-0.7}
            >
              {Intl.NumberFormat('en-MY', { style: 'currency', currency: 'MYR' }).format(
                (subTotal && subTotal + calculatedSST) || 0
              )}
            </Typography>
          </Stack>
        </Box>

        {cartData ? (
          <LoadingButton
            variant="contained"
            startIcon={<Iconify icon="fluent:payment-16-filled" width={20} sx={{ mr: 1 }} />}
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
          >
            Check out
          </LoadingButton>
        )}
      </Box>
    );
  }

  return (
    <Box height={1} position="relative">
      <Stack
        sx={{
          // borderRadius: 2,
          minHeight: 1,
          overflow: 'hidden',
          boxShadow: 5,
        }}
      >
        {/* <Box sx={{ bgcolor: 'black', p: 2 }}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Iconify icon="lets-icons:order-fill" width={30} color="white" />

            <ListItemText
              primary="Order Summary"
              secondary="Review Your Order."
              primaryTypographyProps={{ variant: 'subtitle1', color: 'white' }}
              secondaryTypographyProps={{ variant: 'caption', color: 'white' }}
            />
          </Stack>
        </Box> */}

        {subTotal || cartData ? (
          <Stack
            sx={{
              // color: 'black',
              p: 2,
              px: 3,
              flex: 1,
            }}
          >
            <Stack
              sx={{
                '& .MuiTypography-root': {
                  fontSize: 14,
                  fontWeight: 400,
                },
                textWrap: 'nowrap',
              }}
              mt={2}
              width={1}
              spacing={2}
              flexShrink={2}
              // color={grey[800]}
              flex={1}
              justifyContent="space-between"
            >
              <Box>
                <Stack spacing={2}>
                  {cartData
                    ? cartData.cartItem.map((item) => (
                        <Stack key={item.id}>
                          <Stack direction="row" alignItems="center" justifyContent="space-between">
                            <Typography noWrap>
                              {/* {shortenString(`${item.quantity} x ${item.ticketType.title}`, 30)} */}
                              {`${item.quantity} x ${item.ticketType.title}`}
                            </Typography>

                            <Typography>
                              {Intl.NumberFormat('en-MY', {
                                style: 'currency',
                                currency: 'MYR',
                              }).format(item.quantity * item.ticketType.price)}
                            </Typography>
                          </Stack>
                          {item?.cartAddOn?.some((a) => a?.quantity > 0) && (
                            <Stack
                              ml={3}
                              sx={{
                                '& .MuiTypography-root': {
                                  fontSize: 13,
                                  fontWeight: 400,
                                },
                              }}
                            >
                              <Typography
                                sx={{
                                  '&.MuiTypography-root': {
                                    fontWeight: 600,
                                  },
                                }}
                              >
                                Add Ons:
                              </Typography>
                              {item?.cartAddOn
                                // ?.filter((a) => a.selectedQuantity > 0)
                                ?.map((a) => (
                                  <Stack
                                    key={a.id}
                                    direction="row"
                                    alignItems="center"
                                    justifyContent="space-between"
                                  >
                                    <Typography
                                      noWrap
                                    >{`${a.quantity} x ${a.addOn.name}`}</Typography>
                                    <Typography>
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
                            <Stack
                              direction="row"
                              alignItems="center"
                              justifyContent="space-between"
                            >
                              <Typography noWrap>
                                {/* {shortenString(`${ticket.selectedQuantity} x ${ticket.title}`, 30)} */}
                                {`${ticket.selectedQuantity} x ${ticket.title}`}
                              </Typography>
                              <Typography>
                                {Intl.NumberFormat('en-MY', {
                                  style: 'currency',
                                  currency: 'MYR',
                                }).format(ticket.subTotal)}
                              </Typography>
                            </Stack>
                            {ticket?.addOns?.some((a) => a?.selectedQuantity > 0) && (
                              <Stack
                                ml={3}
                                sx={{
                                  '& .MuiTypography-root': {
                                    fontSize: 13,
                                    fontWeight: 400,
                                  },
                                }}
                              >
                                <Typography
                                  sx={{
                                    '&.MuiTypography-root': {
                                      fontWeight: 600,
                                    },
                                  }}
                                >
                                  Add Ons:
                                </Typography>
                                {ticket?.addOns
                                  ?.filter((a) => a.selectedQuantity > 0)
                                  ?.map((item) => (
                                    <Stack
                                      direction="row"
                                      alignItems="center"
                                      justifyContent="space-between"
                                    >
                                      <Typography
                                        noWrap
                                      >{`${item.selectedQuantity} x ${item.name}`}</Typography>
                                      <Typography>
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
              </Box>

              <Stack spacing={2}>
                {cartData && (
                  <Stack spacing={1}>
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
                      />
                      <Button
                        variant="contained"
                        size="small"
                        onClick={handleRedeemDiscount}
                        sx={{ height: 36 }}
                      >
                        Apply
                      </Button>
                    </Stack>

                    {!!cartData.discount && (
                      <Stack maxWidth={200} spacing={1}>
                        <Stack direction="row" spacing={0.5} alignItems="center">
                          <Iconify icon="lets-icons:check-fill" color="success.main" width={13} />
                          <Typography variant="caption" fontSize={12} color="success">
                            Discount code applied
                          </Typography>
                        </Stack>
                        <Stack direction="row" justifyContent="space-between">
                          <Stack direction="row" alignItems="center" spacing={1}>
                            <Typography variant="caption" fontSize={12}>
                              {cartData.discount.code}
                            </Typography>
                            <IconButton size="small" onClick={removeDiscountCode}>
                              <Iconify icon="mdi:trash-outline" width={16} color="error.main" />
                            </IconButton>
                          </Stack>
                          <Typography variant="caption" color="error" fontSize={12}>
                            - {cartData.discount.value}
                          </Typography>
                        </Stack>
                      </Stack>
                    )}
                  </Stack>
                )}

                <Divider />

                {cartData && (
                  <>
                    <Stack
                      direction="row"
                      alignItems="center"
                      gap={10}
                      justifyContent="space-between"
                    >
                      <Typography>Subtotal:</Typography>
                      <Typography>
                        {Intl.NumberFormat('en-MY', { style: 'currency', currency: 'MYR' }).format(
                          subTotal
                        )}
                      </Typography>
                    </Stack>
                    <Stack
                      direction="row"
                      alignItems="center"
                      gap={10}
                      justifyContent="space-between"
                    >
                      <Typography>Discount</Typography>
                      <Typography>
                        -{' '}
                        {Intl.NumberFormat('en-MY', { style: 'currency', currency: 'MYR' }).format(
                          cartData?.orderSummary?.discount
                        )}
                      </Typography>
                    </Stack>
                    <Stack
                      direction="row"
                      alignItems="center"
                      gap={10}
                      justifyContent="space-between"
                    >
                      <Typography>SST:</Typography>
                      <Typography>
                        {Intl.NumberFormat('en-MY', { style: 'currency', currency: 'MYR' }).format(
                          calculatedSST
                        )}
                      </Typography>
                    </Stack>
                    <Divider />
                  </>
                )}

                <Stack
                  direction="row"
                  alignItems="center"
                  gap={10}
                  justifyContent="space-between"
                  sx={{
                    '&  .MuiTypography-root': {
                      fontSize: 20,
                      fontWeight: 600,
                    },
                  }}
                >
                  <Typography>Total:</Typography>
                  <Typography>
                    {Intl.NumberFormat('en-MY', { style: 'currency', currency: 'MYR' }).format(
                      cartData?.orderSummary?.totalPrice
                        ? cartData.orderSummary.totalPrice + calculatedSST
                        : subTotal
                    )}
                  </Typography>
                </Stack>

                {cartData ? (
                  <LoadingButton
                    variant="contained"
                    size="large"
                    startIcon={
                      <Iconify icon="fluent:payment-16-filled" width={20} sx={{ mr: 1 }} />
                    }
                    type="submit"
                    loading={isSubmitting}
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
                      <Iconify
                        icon="material-symbols-light:shopping-cart-checkout-rounded"
                        width={22}
                      />
                    }
                  >
                    Check out
                  </LoadingButton>
                )}
              </Stack>
            </Stack>
          </Stack>
        ) : (
          <Box position="absolute" top="50%" left="50%" sx={{ transform: 'translate(-50%, -50%)' }}>
            <Iconify icon="mdi:cart-outline" width={40} color={grey[300]} />
          </Box>
        )}
      </Stack>
    </Box>
  );
};

export default TicketOverviewCard;

import { toast } from 'sonner';
import { useFormContext } from 'react-hook-form';
import React, { useMemo, useState, useEffect } from 'react';

import { LoadingButton } from '@mui/lab';
import {
  Box,
  Card,
  alpha,
  Stack,
  Button,
  Divider,
  Checkbox,
  TextField,
  Typography,
  IconButton,
} from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';
import { useResponsive } from 'src/hooks/use-responsive';

import { useCartStore } from 'src/utils/store';
import { endpoints, axiosInstance } from 'src/utils/axios';

import Iconify from 'src/components/iconify';
import MarkdownContent from 'src/components/markdown/MarkdownContent';

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
  const collapse = useBoolean(true); // Default to open in mobile view
  const [calculatedSST, setCalculatedSST] = useState(null);
  const [resourceConfirmations, setResourceConfirmations] = useState({});

  const {
    formState: { isSubmitting },
  } = useFormContext();

  const subTotal = useMemo(() => {
    if (!cartData && tickets?.length) {
      return tickets.reduce((acc, cur) => {
        const ticketSubtotal = cur.subTotal || 0;
        const addOnsTotal = (cur?.addOns || []).reduce(
          (a, b) => a + (b.price || 0) * (b.selectedQuantity || 0),
          0
        );
        return acc + ticketSubtotal + addOnsTotal;
      }, 0);
    }

    return cartData?.orderSummary?.subtotal || 0;
  }, [tickets, cartData]);

  const total = useMemo(() => {
    if (!cartData && tickets?.length) {
      return tickets.reduce((acc, cur) => {
        const ticketSubtotal = cur.subTotal || 0;
        const addOnsTotal = (cur?.addOns || []).reduce(
          (a, b) => a + (b.price || 0) * (b.selectedQuantity || 0),
          0
        );
        return acc + ticketSubtotal + addOnsTotal;
      }, 0);
    }

    return (cartData?.orderSummary?.totalPrice || 0) + calculatedSST || 0;
  }, [cartData, tickets, calculatedSST]);

  const totalTicketsQuantitySelected = useMemo(() => {
    const ticketsTotal = tickets.reduce((acc, cur) => acc + cur.selectedQuantity, 0);
    return ticketsTotal;
  }, [tickets]);
  const allResourcesConfirmed = useMemo(() => {
    if (!cartData?.event?.campResources?.length) return true;
    return cartData.event.campResources.every((resource) => resourceConfirmations[resource.id]);
  }, [cartData?.event?.campResources, resourceConfirmations]);

  const handleRedeemDiscount = async () => {
    if (!discountCode) {
      toast.error('Please enter a discount code');
      return;
    }

    try {
      const res = await axiosInstance.post('/api/cart/redeemDiscountCode', { discountCode });
      toast.success(res?.data?.message);
      cartMutate();
      setDiscountCode('');
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
    const sst = eventData?.eventSetting?.sst || null;
    const taxablePrice = subTotal - (cartData?.orderSummary?.discount || 0);

    const sstPrice = parseFloat(((taxablePrice * sst) / 100).toFixed(2));

    if (cartData?.orderSummary?.totalPrice === 0) {
      setCalculatedSST(0);
    } else {
      setCalculatedSST(sstPrice);
    }
  }, [eventData, subTotal, cartData]);

  // if (mdDown) {
  //   return (
  //     <Card
  //       elevation={2}
  //       sx={{
  //         position: 'sticky',
  //         bottom: 0,
  //         left: 0,
  //         right: 0,
  //         zIndex: 10,
  //         borderRadius: '16px 16px 0 0',
  //         overflow: 'hidden',
  //         borderTop: 1,
  //         borderColor: 'divider',
  //         boxShadow: '0 -4px 20px rgba(0,0,0,0.08)',
  //         pb: 2,
  //       }}
  //     >
  //       <Collapse in={collapse.value} timeout="auto">
  //         <Box
  //           sx={{
  //             maxHeight: '50vh',
  //             overflowY: 'auto',
  //             p: 2.5,
  //             pb: 1.5,
  //             '&::-webkit-scrollbar': {
  //               width: '6px',
  //             },
  //             '&::-webkit-scrollbar-thumb': {
  //               background: (theme) => alpha(theme.palette.text.primary, 0.2),
  //               borderRadius: '10px',
  //             },
  //           }}
  //         >
  //           {!totalTicketsQuantitySelected ? (
  //             <Stack
  //               direction="row"
  //               spacing={1.5}
  //               alignItems="center"
  //               justifyContent="center"
  //               sx={{
  //                 py: 4,
  //                 px: 2,
  //                 borderRadius: 2,
  //                 bgcolor: (theme) => alpha(theme.palette.grey[200], 0.5),
  //               }}
  //             >
  //               <Iconify
  //                 icon="solar:cart-large-minimalistic-outline"
  //                 width={24}
  //                 color="text.secondary"
  //               />
  //               <Typography color="text.secondary" fontWeight={500}>
  //                 No tickets selected
  //               </Typography>
  //             </Stack>
  //           ) : (
  //             <Stack spacing={2.5}>
  //               <Typography variant="h6">Order Summary</Typography>

  //               <Card
  //                 elevation={0}
  //                 sx={{
  //                   p: 2,
  //                   borderRadius: 1,
  //                   bgcolor: (theme) => theme.palette.background.neutral,
  //                   border: '1px solid',
  //                   borderColor: 'divider',
  //                 }}
  //               >
  //                 <Stack spacing={2}>
  //                   {tickets
  //                     .filter((ticket) => ticket.selectedQuantity > 0)
  //                     .map((ticket) => (
  //                       <Stack
  //                         key={ticket.id}
  //                         direction="row"
  //                         alignItems="center"
  //                         justifyContent="space-between"
  //                       >
  //                         <Stack direction="row" alignItems="center" spacing={1}>
  //                           <Iconify icon="mdi:ticket-outline" width={16} />
  //                           <Typography
  //                             sx={{ fontWeight: 500 }}
  //                           >{`${ticket.selectedQuantity} × ${ticket.title}`}</Typography>
  //                         </Stack>
  //                         <Typography sx={{ fontWeight: 600 }}>
  //                           {Intl.NumberFormat('en-MY', {
  //                             style: 'currency',
  //                             currency: 'MYR',
  //                           }).format(ticket.subTotal)}
  //                         </Typography>
  //                       </Stack>
  //                     ))}
  //                 </Stack>
  //               </Card>

  //               <Card
  //                 elevation={0}
  //                 sx={{
  //                   p: 2,
  //                   borderRadius: 1,
  //                   border: '1px solid',
  //                   borderColor: 'divider',
  //                 }}
  //               >
  //                 <Stack spacing={2}>
  //                   <Stack direction="row" alignItems="center" justifyContent="space-between">
  //                     <Typography color="text.secondary">SST:</Typography>
  //                     <Typography fontWeight={500}>
  //                       {Intl.NumberFormat('en-MY', {
  //                         style: 'currency',
  //                         currency: 'MYR',
  //                       }).format(calculatedSST)}
  //                     </Typography>
  //                   </Stack>

  //                   <Divider />

  //                   <Stack direction="row" alignItems="center" justifyContent="space-between">
  //                     <Typography variant="subtitle1">Total:</Typography>
  //                     <Typography
  //                       variant="h6"
  //                       color={(theme) => (theme.palette.mode === 'dark' ? 'grey.300' : 'grey.800')}
  //                     >
  //                       {Intl.NumberFormat('en-MY', {
  //                         style: 'currency',
  //                         currency: 'MYR',
  //                       }).format(total)}
  //                     </Typography>
  //                   </Stack>
  //                 </Stack>
  //               </Card>
  //             </Stack>
  //           )}
  //         </Box>
  //       </Collapse>

  //       <Box
  //         onClick={() => collapse.onToggle()}
  //         sx={{
  //           display: 'flex',
  //           alignItems: 'center',
  //           justifyContent: 'space-between',
  //           cursor: 'pointer',
  //           mx: 2.5,
  //           my: 1.5,
  //           p: 1.5,
  //           borderRadius: 2,
  //           bgcolor: (theme) => alpha(theme.palette.grey[200], 0.5),
  //           '&:hover': {
  //             bgcolor: (theme) => alpha(theme.palette.grey[300], 0.5),
  //           },
  //         }}
  //       >
  //         <Typography variant="subtitle1">
  //           {collapse.value ? 'Hide Order Summary' : 'View Order Summary'}
  //         </Typography>
  //         <Stack direction="row" alignItems="center" spacing={1.5}>
  //           <Typography
  //             variant="subtitle1"
  //             fontWeight={600}
  //             color={(theme) => (theme.palette.mode === 'dark' ? 'grey.300' : 'grey.800')}
  //           >
  //             {Intl.NumberFormat('en-MY', { style: 'currency', currency: 'MYR' }).format(
  //               total || 0
  //             )}
  //           </Typography>
  //           <Iconify
  //             icon={collapse.value ? 'iconamoon:arrow-up-2-bold' : 'iconamoon:arrow-down-2-bold'}
  //             width={20}
  //             sx={{
  //               transition: 'transform 0.2s ease',
  //               transform: collapse.value ? 'rotate(0deg)' : 'rotate(0deg)',
  //             }}
  //           />
  //         </Stack>
  //       </Box>

  //       <Box sx={{ px: 2.5 }}>
  //         {cartData ? (
  //           <LoadingButton
  //             variant="contained"
  //             fullWidth
  //             size="large"
  //             startIcon={<Iconify icon="fluent:payment-16-filled" width={20} />}
  //             sx={{
  //               borderRadius: 2,
  //               py: 1.5,
  //               bgcolor: (theme) => (theme.palette.mode === 'dark' ? '#fff' : '#000'),
  //               color: (theme) => (theme.palette.mode === 'dark' ? '#000' : '#fff'),
  //               '&:hover': {
  //                 bgcolor: (theme) => (theme.palette.mode === 'dark' ? '#f5f5f5' : '#333'),
  //                 transform: 'translateY(-2px)',
  //               },
  //               transition: 'all 0.2s',
  //               '& .MuiSvgIcon-root': {
  //                 color: (theme) => (theme.palette.mode === 'dark' ? '#000' : '#fff'),
  //               },
  //             }}
  //           >
  //             Proceed to payment
  //           </LoadingButton>
  //         ) : (
  //           <LoadingButton
  //             variant="contained"
  //             size="large"
  //             fullWidth
  //             onClick={handleCheckout}
  //             startIcon={
  //               <Iconify icon="material-symbols-light:shopping-cart-checkout-rounded" width={22} />
  //             }
  //             sx={{
  //               borderRadius: 2,
  //               py: 1.5,
  //               bgcolor: (theme) => (theme.palette.mode === 'dark' ? '#fff' : '#000'),
  //               color: (theme) => (theme.palette.mode === 'dark' ? '#000' : '#fff'),
  //               '&:hover': {
  //                 bgcolor: (theme) => (theme.palette.mode === 'dark' ? '#f5f5f5' : '#333'),
  //                 transform: 'translateY(-2px)',
  //               },
  //               transition: 'all 0.2s',
  //               '& .MuiSvgIcon-root': {
  //                 color: (theme) => (theme.palette.mode === 'dark' ? '#000' : '#fff'),
  //               },
  //             }}
  //           >
  //             Check Out
  //           </LoadingButton>
  //         )}
  //       </Box>
  //     </Card>
  //   );
  // }

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
      {subTotal || cartData ? (
        <Stack
          sx={{
            p: 2.5,
            flex: 1,
            height: 1,
            // height: 'calc(100% - 68px)',
            overflowY: 'auto',
            // bgcolor: 'beige',
            '&::-webkit-scrollbar': {
              width: '6px',
            },
            '&::-webkit-scrollbar-thumb': {
              background: (theme) => alpha(theme.palette.text.primary, 0.2),
              borderRadius: '10px',
            },
          }}
        >
          <Stack spacing={3} height={1}>
            <Card
              elevation={0}
              sx={{
                p: 2,
                borderRadius: 1,
                bgcolor: (theme) => theme.palette.background.neutral,
                border: '1px solid',
                borderColor: 'divider',
                maxHeight: 300,
                overflowY: 'auto',
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
                                fontSize: '0.75rem',
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
                                <Typography
                                  variant="caption"
                                  sx={{ fontWeight: 600, fontSize: '0.8rem' }}
                                >
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
                                  fontSize: '0.75rem',
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
                                    <Typography
                                      variant="caption"
                                      sx={{ fontWeight: 600, fontSize: '0.8rem' }}
                                    >
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
                  <Typography variant="subtitle2" mb={0.5}>
                    Discount Code
                  </Typography>
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
                        sx: { borderRadius: 1.5 },
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
                        bgcolor: (theme) => (theme.palette.mode === 'dark' ? '#fff' : '#000'),
                        color: (theme) => (theme.palette.mode === 'dark' ? '#000' : '#fff'),
                        '&:hover': {
                          bgcolor: (theme) => (theme.palette.mode === 'dark' ? '#f5f5f5' : '#333'),
                        },
                      }}
                    >
                      Apply
                    </Button>
                  </Stack>

                  {!!cartData.discount && (
                    <Stack spacing={1} sx={{ mt: 1 }}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Iconify icon="lets-icons:check-fill" color="success.main" width={16} />
                        <Typography variant="body2" color="success.main" fontWeight={500}>
                          Discount code applied!
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
                              },
                            }}
                          >
                            <Iconify icon="mdi:trash-outline" width={14} color="error.main" />
                          </IconButton>
                        </Stack>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          {/* <Typography variant="body2" fontWeight={500}>
                            Type: {cartData.discount.type}
                          </Typography> */}
                        </Stack>
                        <Typography variant="body2" color="error.main" fontWeight={600}>
                          -{' '}
                          {Intl.NumberFormat('en-MY', {
                            style: 'currency',
                            currency: 'MYR',
                          }).format(cartData.orderSummary.discount)}
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
                      -{' '}
                      {Intl.NumberFormat('en-MY', { style: 'currency', currency: 'MYR' }).format(
                        cartData.orderSummary.discount
                      )}
                    </Typography>
                  </Stack>
                )}

                {(cartData?.orderSummary?.subtotal || 0) > 0 && (
                  <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Typography color="text.secondary">SST:</Typography>
                    <Typography fontWeight={500}>
                      {Intl.NumberFormat('en-MY', {
                        style: 'currency',
                        currency: 'MYR',
                      }).format(calculatedSST)}
                    </Typography>
                  </Stack>
                )}

                <Divider />

                <Stack direction="row" alignItems="center" justifyContent="space-between">
                  <Typography variant="subtitle1">Total:</Typography>
                  <Typography
                    variant="h6"
                    color={(theme) => (theme.palette.mode === 'dark' ? 'grey.300' : 'grey.800')}
                  >
                    {Intl.NumberFormat('en-MY', {
                      style: 'currency',
                      currency: 'MYR',
                    }).format(
                      total
                      // cartData.orderSummary.totalPrice >= 0
                      //   ? cartData.orderSummary.totalPrice + calculatedSST
                      //   : subTotal
                    )}
                  </Typography>
                </Stack>
              </Stack>
            </Card>
            {cartData?.event?.campResources?.length > 0 && (
              <Card
                elevation={0}
                sx={{
                  p: 0.5,
                  borderRadius: 1,
                  border: 'none',
                  boxShadow: 'none',
                }}
              >
                <Stack spacing={0}>
                  {cartData.event.campResources.map((resource) => (
                    <Box key={resource.id}>
                      <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mt: -3 }}>
                        <Checkbox
                          size="small"
                          checked={resourceConfirmations[resource.id] || false}
                          onChange={(e) =>
                            setResourceConfirmations((prev) => ({
                              ...prev,
                              [resource.id]: e.target.checked,
                            }))
                          }
                          sx={{ p: 0, mr: 0.5 }}
                        />
                        <Box sx={{ flex: 'none', display: 'flex', alignItems: 'center' }}>
                          <MarkdownContent
                            content={resource.content}
                            spacing={0.5}
                            sx={{
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              '& p': {
                                m: 0,
                                display: 'inline',
                                fontSize: '0.875rem',
                              },
                            }}
                          />
                        </Box>
                      </Stack>
                    </Box>
                  ))}
                </Stack>
              </Card>
            )}
            {cartData ? (
              <LoadingButton
                variant="contained"
                size="large"
                startIcon={<Iconify icon="fluent:payment-16-filled" width={20} />}
                type="submit"
                loading={isSubmitting}
                disabled={!cartData?.cartItem?.length || !allResourcesConfirmed}
                sx={{
                  borderRadius: 1,
                  py: 1.5,
                  bgcolor: (theme) => (theme.palette.mode === 'dark' ? '#fff' : '#000'),
                  color: (theme) => (theme.palette.mode === 'dark' ? '#000' : '#fff'),
                  '&:hover': {
                    bgcolor: (theme) => (theme.palette.mode === 'dark' ? '#f5f5f5' : '#333'),
                    transform: 'translateY(-2px)',
                  },
                  transition: 'all 0.2s',
                  '& .MuiSvgIcon-root': {
                    color: (theme) => (theme.palette.mode === 'dark' ? '#000' : '#fff'),
                  },
                  mt: 'auto',
                }}
              >
                {!allResourcesConfirmed ? 'Proceed to Payment' : 'Proceed to Payment'}
                {/* Proceed to Payment */}
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
                disabled={!totalTicketsQuantitySelected}
                sx={{
                  py: 1.5,
                  bgcolor: (theme) => (theme.palette.mode === 'dark' ? '#fff' : '#000'),
                  color: (theme) => (theme.palette.mode === 'dark' ? '#000' : '#fff'),
                  '&:hover': {
                    bgcolor: (theme) => (theme.palette.mode === 'dark' ? '#f5f5f5' : '#333'),
                    transform: 'translateY(-2px)',
                  },
                  transition: 'all 0.2s',
                  '& .MuiSvgIcon-root': {
                    color: (theme) => (theme.palette.mode === 'dark' ? '#000' : '#fff'),
                  },
                  mt: 'auto',
                }}
              >
                Next
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
            p: 4,
          }}
        >
          <Iconify
            icon="solar:cart-large-minimalistic-broken"
            width={60}
            sx={{
              color: (theme) => alpha(theme.palette.text.primary, 0.2),
              mb: 1,
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

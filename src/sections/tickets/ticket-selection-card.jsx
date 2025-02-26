import { toast } from 'sonner';
import React, { useRef, useMemo, useState, useEffect, useLayoutEffect } from 'react';

import { LoadingButton } from '@mui/lab';
import {
  Box,
  Stack,
  alpha,
  Typography,
  IconButton,
  ListItemText,
  CircularProgress,
  Collapse,
  Divider,
} from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';
import { useResponsive } from 'src/hooks/use-responsive';

import axiosInstance from 'src/utils/axios';
import { useCartStore } from 'src/utils/store';

import Image from 'src/components/image';
import Iconify from 'src/components/iconify';

import useGetCartData from './hooks/use-get-cart';

const TicketSelectionCard = () => {
  const smDown = useResponsive('down', 'sm');
  const mdDown = useResponsive('down', 'md');
  const ref = useRef();
  const testRef = useRef();
  const isOverflow = useBoolean();
  const isTicketsOverflow = useBoolean();
  const [unavailableTickets, setUnavailableTicket] = useState(null);
  const collapse = useBoolean();

  const tixs = useCartStore((state) => state.tickets);

  const { eventData, mutate: eventMutate, cartMutate } = useGetCartData();

  const subTotal = useMemo(
    () => tixs.reduce((acc, tix) => acc + tix.selectedQuantity * tix.price, 0),
    [tixs]
  );

  const totalTicketsQuantitySelected = useMemo(() => {
    const ticketsTotal = tixs.reduce((acc, cur) => acc + cur.selectedQuantity, 0);
    return ticketsTotal;
  }, [tixs]);

  const updateTics = useCartStore((state) => state.updateTickets);

  const loading = useBoolean();

  const handleCheckout = async () => {
    try {
      loading.onTrue();

      await new Promise((resolve) => setTimeout(resolve, 3000));

      // Filter only selected tickets
      const tickets = tixs.filter((tix) => tix.selectedQuantity !== 0);

      await axiosInstance.post('/api/cart/checkout', {
        tickets,
        eventId: eventData.id,
      });
      toast.info('Your cart is ready!');
      cartMutate();
    } catch (error) {
      if (error?.ticketId) {
        setUnavailableTicket(error?.ticketId);
      }
      toast.error(error?.message);
    } finally {
      loading.onFalse();
      eventMutate();
    }
  };

  const tickets = tixs.map((ticket) => {
    if (!ticket) return null;

    const maxPerOrder = ticket?.ticketTypeRequirement?.maximumTicketPerOrder;
    const availableQuantity = ticket?.quantity;
    const selectedQuantity = ticket?.selectedQuantity;

    const maxSelectable = maxPerOrder
      ? Math.min(maxPerOrder, availableQuantity)
      : availableQuantity;

    const isMinusDisabled = selectedQuantity === 0;
    const isPlusDisabled = selectedQuantity === maxSelectable;

    const unavailable = unavailableTickets && ticket.id === unavailableTickets;

    return (
      // <Box key={ticket.id} overflow="hidden">
      //   <Box
      //     sx={{
      //       position: 'relative',
      //       border: 2,
      //       py: 6,
      //       px: 2,
      //       borderRadius: 2,
      //       borderStyle: !ticket?.selectedQuantity && 'dashed',
      //       borderColor: (theme) =>
      //         // eslint-disable-next-line no-nested-ternary
      //         ticket?.selectedQuantity
      //           ? theme.palette.info.main
      //           : unavailable
      //             ? theme.palette.error.light
      //             : theme.palette.divider,
      //       display: 'grid',
      //       gridTemplateColumns: !smDown ? 'repeat(4,1fr)' : 'repeat(2,1fr)',
      //       alignItems: 'center',
      //       justifyItems: 'center',
      //       bgcolor: '#f9f9f9',
      //       opacity: !ticket.quantity && 0.5,
      // ':before': {
      //   content: "''",
      //   position: 'absolute',
      //   bgcolor: 'white',
      //   width: 40,
      //   height: 40,
      //   left: -28,
      //   border: 2,
      //   borderColor: (theme) =>
      //     ticket?.selectedQuantity ? theme.palette.info.main : theme.palette.divider,
      //   borderRadius: '50%',
      //   borderStyle: !ticket?.selectedQuantity && 'dashed',
      // },
      // ':after': {
      //   content: "''",
      //   position: 'absolute',
      //   bgcolor: 'white',
      //   width: 40,
      //   height: 40,
      //   right: -28,
      //   border: 2,
      //   borderColor: (theme) =>
      //     ticket?.selectedQuantity ? theme.palette.info.main : theme.palette.divider,
      //   borderRadius: '50%',
      //   borderStyle: !ticket?.selectedQuantity && 'dashed',
      // },
      //     }}
      //   >
      //     <Stack spacing={0.5} justifySelf="start">
      //       <ListItemText
      //         primary={ticket.title}
      //         secondary={`RM ${ticket.price}`}
      //         slotProps={{
      //           secondary: {
      //             display: !smDown && 'none',
      //             variant: 'subtitle2',
      //             fontSize: 12,
      //           },
      //         }}
      //       />

      //       <Typography variant="caption" whiteSpace="normal" color="text.secondary">
      //         {ticket.description}
      //       </Typography>
      //     </Stack>

      //     {!smDown && (
      //       <ListItemText
      //         primary="Price"
      //         secondary={Intl.NumberFormat('en-MY', {
      //           style: 'currency',
      //           currency: 'MYR',
      //         }).format(ticket.price)}
      //       />
      //     )}

      //     {ticket.quantity === 0 ? (
      //       <Box sx={{ gridColumn: 'span 2' }}>
      //         <Typography variant="subtitle2" color="text.secondary">
      //           Sold out
      //         </Typography>
      //       </Box>
      //     ) : (
      //       <>
      //         <Stack direction="row" alignItems="center" justifyContent="center">
      //           <IconButton
      // disabled={isMinusDisabled}
      // onClick={() =>
      //   updateTics(ticket.id, {
      //     selectedQuantity:
      //       ticket.selectedQuantity < 1 ? 0 : ticket.selectedQuantity - 1,
      //     subTotal: ticket.selectedQuantity * ticket.price,
      //   })
      // }
      // onMouseDown={(e) => {
      //   e.currentTarget.style.transform = 'translateY(1px)';
      // }}
      // onMouseUp={(e) => {
      //   e.currentTarget.style.transform = 'translateY(0)';
      // }}
      // onMouseLeave={(e) => {
      //   e.currentTarget.style.transform = 'translateY(0)';
      // }}
      //           >
      // <Iconify
      //   icon="ic:round-minus"
      //   width={15}
      //   color={isMinusDisabled ? 'grey' : 'red'}
      // />
      //           </IconButton>
      //           <TextField
      //             value={ticket.selectedQuantity}
      //             type="number"
      //             variant="outlined"
      //             size="small"
      //             sx={{
      //               width: 50,
      //               '& input': {
      //                 textAlign: 'center', // Center-align the text
      //               },
      //               pointerEvents: 'none',
      //             }}
      //           />
      //           <IconButton
      // onClick={(e) =>
      //   updateTics(
      //     ticket.id,
      //     ticket?.ticketTypeRequirement?.maximumTicketPerOrder
      //       ? {
      //           selectedQuantity:
      //             ticket.selectedQuantity <
      //             ticket?.ticketTypeRequirement?.maximumTicketPerOrder
      //               ? ticket.selectedQuantity + 1
      //               : ticket?.ticketTypeRequirement?.maximumTicketPerOrder,
      //           subTotal: ticket.selectedQuantity * ticket.price,
      //         }
      //       : {
      //           selectedQuantity: ticket.selectedQuantity + 1,
      //           subTotal: ticket.selectedQuantity * ticket.price,
      //         }
      //   )
      // }
      // disabled={isPlusDisabled}
      // onMouseDown={(e) => {
      //   e.currentTarget.style.transform = 'translateY(1px)';
      // }}
      // onMouseUp={(e) => {
      //   e.currentTarget.style.transform = 'translateY(0)';
      // }}
      // onMouseLeave={(e) => {
      //   e.currentTarget.style.transform = 'translateY(0)';
      // }}
      //           >
      // <Iconify
      //   icon="material-symbols:add-rounded"
      //   width={15}
      //   color={isPlusDisabled ? 'grey' : 'green'}
      // />
      //           </IconButton>
      //         </Stack>
      //         {!smDown && (
      //           <ListItemText
      //             primary="Subtotal"
      //             secondary={Intl.NumberFormat('en-MY', {
      //               style: 'currency',
      //               currency: 'MYR',
      //             }).format(ticket.subTotal)}
      //           />
      //         )}
      //       </>
      //     )}
      //   </Box>
      // </Box>

      <Box
        sx={{
          bgcolor: '#EEEEEE',
          minHeight: 67,
          borderRadius: 1.5,
          p: 5,
          position: 'relative',
          ':before': {
            content: "''",
            position: 'absolute',
            bgcolor: 'white',
            width: 40,
            height: 40,
            left: -28,
            top: '50%',
            transform: 'translateY(-50%)',
            borderRadius: '50%',
          },
          ':after': {
            content: "''",
            position: 'absolute',
            bgcolor: 'white',
            width: 40,
            height: 40,
            right: -28,
            borderRadius: '50%',
            top: '50%',
            transform: 'translateY(-50%)',
          },
        }}
      >
        <Stack
          direction="row"
          alignItems={!smDown ? 'center' : 'end'}
          justifyContent="space-between"
        >
          <Stack spacing={2.5}>
            <ListItemText
              primary={ticket.title}
              secondary="lorem10l orem10lore m10lorem10lore m10lorem10"
              slotProps={{
                primary: {
                  fontWeight: 600,
                  letterSpacing: -0.9,
                  fontSize: 20,
                  color: '#00000',
                },
                secondary: {
                  variant: 'caption',
                  fontWeight: 500,
                  fontSize: 14,
                  letterSpacing: -0.9,
                  color: '#606060',
                  maxWidth: 300,
                  whiteSpace: 'pretty',
                },
              }}
            />
            <ListItemText
              primary="Price"
              secondary={Intl.NumberFormat('en-MY', { style: 'currency', currency: 'MYR' }).format(
                ticket.price
              )}
              slotProps={{
                primary: {
                  fontWeight: 600,
                  letterSpacing: -0.9,
                  fontSize: 18,
                  color: '#00000',
                },
                secondary: {
                  mt: -0.5,
                  fontWeight: 600,
                  letterSpacing: -0.9,
                  fontSize: 17,
                  color: '#00000',
                },
              }}
            />
          </Stack>

          <Stack direction="row" alignItems="center" spacing={2} mr={!smDown && 5}>
            <IconButton
              sx={{
                bgcolor: '#00564B',
                '&:hover': { bgcolor: '#00564B99' },
                borderRadius: 1,
                ...(isMinusDisabled && {
                  pointerEvents: 'none',
                  bgcolor: '#D9D9D9',
                }),
              }}
              onClick={() =>
                updateTics(ticket.id, {
                  selectedQuantity: ticket.selectedQuantity < 1 ? 0 : ticket.selectedQuantity - 1,
                  subTotal: ticket.selectedQuantity * ticket.price,
                })
              }
              onMouseDown={(e) => {
                e.currentTarget.style.transform = 'translateY(1px)';
              }}
              onMouseUp={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <Iconify
                icon="ic:round-minus"
                width={15}
                color={isMinusDisabled ? '#676767' : 'white'}
              />
            </IconButton>
            <Typography variant="subtitle1">{ticket.selectedQuantity}</Typography>
            <IconButton
              sx={{
                bgcolor: '#00564B',
                borderRadius: 1,
                '&:hover': { bgcolor: '#00564B99' },
                ...(isPlusDisabled && {
                  pointerEvents: 'none',
                  bgcolor: '#D9D9D9',
                }),
              }}
              onClick={(e) =>
                updateTics(
                  ticket.id,
                  ticket?.ticketTypeRequirement?.maximumTicketPerOrder
                    ? {
                        selectedQuantity:
                          ticket.selectedQuantity <
                          ticket?.ticketTypeRequirement?.maximumTicketPerOrder
                            ? ticket.selectedQuantity + 1
                            : ticket?.ticketTypeRequirement?.maximumTicketPerOrder,
                        subTotal: ticket.selectedQuantity * ticket.price,
                      }
                    : {
                        selectedQuantity: ticket.selectedQuantity + 1,
                        subTotal: ticket.selectedQuantity * ticket.price,
                      }
                )
              }
              onMouseDown={(e) => {
                e.currentTarget.style.transform = 'translateY(1px)';
              }}
              onMouseUp={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <Iconify
                icon="material-symbols:add-rounded"
                width={15}
                color={isPlusDisabled ? '#676767' : 'white'}
              />
            </IconButton>
          </Stack>
        </Stack>
      </Box>
    );
  });

  useEffect(() => {
    const el = ref?.current;
    if (!el) return;
    if (!ref.current) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = ref.current;
      if (scrollTop + clientHeight >= scrollHeight) {
        isOverflow.onFalse();
      } else {
        isOverflow.onTrue();
      }
    };

    handleScroll();

    el.addEventListener('scroll', handleScroll);

    // eslint-disable-next-line consistent-return
    return () => {
      if (el) {
        el.removeEventListener('scroll', handleScroll);
      }
    };
  }, [isOverflow]);

  const scrollToTop = () => {
    const el = ref.current;
    if (!el) return;
    el.scrollTop = 0;
  };

  useLayoutEffect(() => {
    if (!testRef.current || !ref.current) return;

    const { clientHeight } = ref.current;
    const { scrollHeight } = testRef.current;

    if (scrollHeight >= clientHeight) {
      isTicketsOverflow.onTrue();
    } else {
      isTicketsOverflow.onFalse();
    }
  }, [isTicketsOverflow]);

  return (
    <Stack
      component={Box}
      sx={{
        height: 1,
        borderRadius: 2,
        overflow: 'hidden',
        bgcolor: 'white',
      }}
    >
      <Box
        sx={{
          bgcolor: 'black',
          p: 2,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          color: 'whitesmoke',
        }}
      >
        <Stack direction="row" alignItems="center" spacing={2}>
          <Image src="/assets/tickets/ticket-1.svg" width={25} />
          <ListItemText
            primary="Event Ticket"
            secondary={eventData.name}
            primaryTypographyProps={{ variant: 'subtitle1' }}
            secondaryTypographyProps={{ color: 'white', variant: 'caption' }}
          />
        </Stack>
        <Typography>{`{{ event logo }}`}</Typography>
      </Box>
      <Box
        ref={ref}
        flexGrow={1}
        sx={{
          px: 2,
          height: 'calc(100vh - 30vh)',
          overflowY: 'auto',
          overflowX: 'hidden',
          scrollbarWidth: 'thin',
          scrollBehavior: 'smooth',
          transition: 'all ease-in-out .3s',
          transitionTimingFunction: 'linear',
        }}
      >
        {loading.value ? (
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
            }}
          >
            <CircularProgress
              thickness={5}
              size={100}
              sx={{
                color: (theme) => theme.palette.common.black,
                strokeLinecap: 'round',
              }}
            />
          </Box>
        ) : (
          <Stack spacing={1} my={2} component={Box} ref={testRef}>
            {tickets}
          </Stack>
        )}

        <IconButton
          size="small"
          sx={{
            position: 'absolute',
            bottom: 70,
            display: (!isTicketsOverflow.value || isOverflow.value) && 'none',
            right: 10,
            bgcolor: 'black',
            color: 'whitesmoke',
            '&.MuiIconButton-root': {
              '&:hover': {
                bgcolor: alpha('#000000', 0.8),
              },
            },
          }}
          onClick={scrollToTop}
        >
          <Iconify icon="raphael:arrowup" width={22} />
        </IconButton>
      </Box>
      <Box
        p={1}
        mt="auto"
        boxShadow={10}
        sx={{
          ...(mdDown && {
            borderTop: 1.5,
            borderColor: (theme) => theme.palette.divider,
          }),
        }}
      >
        {mdDown && (
          <>
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
                      {tixs
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
                          }).format(11.94)}
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
                          }).format(subTotal && subTotal + 11.94)}
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
                    subTotal && subTotal + 11.94
                  )}
                </Typography>
              </Stack>
            </Box>
          </>
        )}
        <LoadingButton
          variant="contained"
          fullWidth
          loading={loading.value}
          onClick={handleCheckout}
          disabled={!totalTicketsQuantitySelected}
          startIcon={
            <Iconify icon="material-symbols-light:shopping-cart-checkout-rounded" width={22} />
          }
        >
          Check out
        </LoadingButton>
      </Box>
    </Stack>
  );
};

export default TicketSelectionCard;

// [
//   {
//     "amount": "1000",
//     "currency": "MYR",
//     "customer_name": "Afiq",
//     "callback_url": "http://localhost:81/",
//     "return_url": "http://localhost:81/event/c1429516-3832-49b4-9cd0-5039a12dbc77"
//   }
// ]

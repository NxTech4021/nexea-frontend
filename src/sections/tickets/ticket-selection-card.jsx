import { toast } from 'sonner';
import React, { useRef, useMemo, useEffect } from 'react';

import { LoadingButton } from '@mui/lab';
import {
  Box,
  Stack,
  alpha,
  TextField,
  Typography,
  IconButton,
  ListItemText,
  CircularProgress,
} from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';
import { useResponsive } from 'src/hooks/use-responsive';

import axiosInstance from 'src/utils/axios';
import { useCartStore } from 'src/utils/store';

import { useGetCart } from 'src/api/cart/cart';

import Image from 'src/components/image';
import Iconify from 'src/components/iconify';

import useGetCartData from './hooks/use-get-cart';

const TicketSelectionCard = () => {
  const smDown = useResponsive('down', 'sm');
  const ref = useRef();
  const isOverflow = useBoolean();

  const { eventData, mutate: eventMutate } = useGetCartData();

  const { mutate } = useGetCart();

  const tixs = useCartStore((state) => state.tickets);

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
      mutate();
    } catch (error) {
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

    return (
      <Box key={ticket.id} overflow="hidden">
        <Box
          sx={{
            position: 'relative',
            border: 2,
            py: 6,
            px: 2,
            borderRadius: 2,
            borderStyle: !ticket?.selectedQuantity && 'dashed',
            borderColor: (theme) =>
              ticket?.selectedQuantity ? theme.palette.info.main : theme.palette.divider,
            display: 'grid',
            gridTemplateColumns: !smDown ? 'repeat(4,1fr)' : 'repeat(2,1fr)',
            alignItems: 'center',
            justifyItems: 'center',
            bgcolor: '#f9f9f9',
            opacity: !ticket.quantity && 0.5,
            ':before': {
              content: "''",
              position: 'absolute',
              bgcolor: 'white',
              width: 40,
              height: 40,
              left: -28,
              border: 2,
              borderColor: (theme) =>
                ticket?.selectedQuantity ? theme.palette.info.main : theme.palette.divider,
              borderRadius: '50%',
              borderStyle: !ticket?.selectedQuantity && 'dashed',
            },
            ':after': {
              content: "''",
              position: 'absolute',
              bgcolor: 'white',
              width: 40,
              height: 40,
              right: -28,
              border: 2,
              borderColor: (theme) =>
                ticket?.selectedQuantity ? theme.palette.info.main : theme.palette.divider,
              borderRadius: '50%',
              borderStyle: !ticket?.selectedQuantity && 'dashed',
            },
          }}
        >
          <Stack spacing={0.5} justifySelf="start">
            <ListItemText
              primary={ticket.title}
              secondary={`RM ${ticket.price}`}
              slotProps={{
                secondary: {
                  display: !smDown && 'none',
                  variant: 'subtitle2',
                  fontSize: 12,
                },
              }}
            />

            <Typography variant="caption" whiteSpace="normal" color="text.secondary">
              {ticket.description}
            </Typography>
          </Stack>

          {!smDown && (
            <ListItemText
              primary="Price"
              secondary={Intl.NumberFormat('en-MY', {
                style: 'currency',
                currency: 'MYR',
              }).format(ticket.price)}
            />
          )}

          {ticket.quantity === 0 ? (
            <Box sx={{ gridColumn: 'span 2' }}>
              <Typography variant="subtitle2" color="text.secondary">
                Sold out
              </Typography>
            </Box>
          ) : (
            <>
              <Stack direction="row" alignItems="center" justifyContent="center">
                <IconButton
                  disabled={isMinusDisabled}
                  onClick={() =>
                    updateTics(ticket.id, {
                      selectedQuantity:
                        ticket.selectedQuantity < 1 ? 0 : ticket.selectedQuantity - 1,
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
                    color={isMinusDisabled ? 'grey' : 'red'}
                  />
                </IconButton>
                <TextField
                  value={ticket.selectedQuantity}
                  type="number"
                  variant="outlined"
                  size="small"
                  sx={{
                    width: 50,
                    '& input': {
                      textAlign: 'center', // Center-align the text
                    },
                    pointerEvents: 'none',
                  }}
                />
                <IconButton
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
                  disabled={isPlusDisabled}
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
                    color={isPlusDisabled ? 'grey' : 'green'}
                  />
                </IconButton>
              </Stack>
              {!smDown && (
                <ListItemText
                  primary="Subtotal"
                  secondary={Intl.NumberFormat('en-MY', {
                    style: 'currency',
                    currency: 'MYR',
                  }).format(ticket.subTotal)}
                />
              )}
            </>
          )}
        </Box>
      </Box>
    );
  });

  useEffect(() => {
    const el = ref?.current;
    if (!el) return;

    const handleScroll = () => {
      if (!ref.current) return;

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

  return (
    <Stack
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
          <Stack spacing={1} my={2}>
            {tickets}
          </Stack>
        )}

        <IconButton
          size="small"
          sx={{
            position: 'absolute',
            bottom: 70,
            display: isOverflow.value && 'none',
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
      <Box p={1} mt="auto">
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

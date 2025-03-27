import useSWR from 'swr';
import dayjs from 'dayjs';
import { toast } from 'sonner';
import { useFieldArray, useFormContext } from 'react-hook-form';
import React, { useRef, useMemo, useState, useEffect, useLayoutEffect } from 'react';

import { LoadingButton } from '@mui/lab';
import {
  Box,
  Stack,
  alpha,
  Button,
  Divider,
  Tooltip,
  MenuItem,
  Collapse,
  TextField,
  Typography,
  IconButton,
  ListItemText,
  CircularProgress,
} from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';
import { useResponsive } from 'src/hooks/use-responsive';

import axiosInstance, { fetcher, endpoints } from 'src/utils/axios';

import Label from 'src/components/label';
import Iconify from 'src/components/iconify';
import { RHFSelect, RHFCheckbox } from 'src/components/hook-form';

import { TextFieldCustom } from './components/text-field';

const defaultAttendee = {
  firstName: '',
  lastName: '',
  email: '',
  phoneNumber: '',
  company: '',
  isForbuyer: false,
};

const TicketInformationCard = () => {
  const collapse = useBoolean();
  const anotherCollapse = useBoolean();
  const [collapseAttendees, setCollapseAttendees] = useState([]);
  const ref = useRef();
  const mdDown = useResponsive('down', 'md');
  const [discountCode, setDiscountCode] = useState(null);
  const boxRef = useRef();
  const cartSessionId = localStorage.getItem('cartSessionId');

  const isOverflow = useBoolean();
  const [activeFieldId, setActiveFieldId] = useState(null);

  const [lastRemoved, setLastRemoved] = useState(null);

  const { data, isLoading: cartLoading, mutate } = useSWR(`/api/cart/${cartSessionId}`, fetcher);

  const isCartExpired = useMemo(() => dayjs(data?.expiryDate).isBefore(dayjs(), 'date'), [data]);

  const ticketTypes = useMemo(() => data?.cartItem, [data]);

  const handleRedeemDiscount = async () => {
    if (!discountCode) {
      toast.error('Please enter a discount code');
      return;
    }

    try {
      const res = await axiosInstance.post('/api/cart/redeemDiscountCode', { discountCode });
      toast.success(res?.data?.message);
      mutate();
    } catch (error) {
      toast.error(error);
    }
  };

  const subTotal = useMemo(
    () => data?.cartItem?.reduce((acc, sum) => acc + sum.quantity * sum.ticketType.price, 0),
    [data]
  );

  const { watch, control, setValue, getValues } = useFormContext();

  const buyer = watch('buyer.isAnAttendee');

  const toggleCollapse = (index) => {
    setCollapseAttendees((prev) =>
      prev.includes(index) ? prev.filter((val) => val !== index) : [...prev, index]
    );
  };

  const { fields, update } = useFieldArray({
    control,
    name: 'attendees',
  });

  const handleChangeTicket = (value) => {
    setValue('buyer.ticket', value);
    const buyerInfo = getValues('buyer');

    const attendees = getValues('attendees');

    const newAttendees = [...attendees];

    if (buyer) {
      const existingTagIndex = newAttendees.findIndex((item) => item.isForbuyer);
      const existingValue = newAttendees[existingTagIndex];

      if (existingTagIndex !== -1) {
        update(existingTagIndex, { ...defaultAttendee, ticket: existingValue.ticket });
        setLastRemoved(null); // Reset last removed after restoring
      }

      const index = newAttendees.findIndex((attendee) => attendee.ticket.id === value);

      const val = {
        firstName: buyerInfo.firstName || '',
        lastName: buyerInfo.lastName || '',
        email: buyerInfo.email || '',
        phoneNumber: buyerInfo.phoneNumber || '',
        company: buyerInfo.company || '',
        ticket: newAttendees[index].ticket,
      };

      if (index !== -1) {
        update(index, { ...val, isForbuyer: true });
      }
    }
  };

  const handleBuyerCheckbox = (val) => {
    setValue('buyer.isAnAttendee', val);
    const attendees = getValues('attendees');

    if (!val) {
      setValue('buyer.ticket', '');
      const latestAttendeeesInfo = attendees.map((item) =>
        item.isForbuyer
          ? { ...defaultAttendee, ticket: item.ticket }
          : { ...item, isForbuyer: false }
      );

      setValue('attendees', latestAttendeeesInfo);
    }
  };

  const onChangeInputBuyer = (e) => {
    const { name, value } = e.target;

    const attendees = getValues('attendees');
    const index = attendees.findIndex((i) => i.isForbuyer);

    if (index !== -1) {
      const updatedAttendee = { ...attendees[index] };

      if (name === 'buyer.firstName') updatedAttendee.firstName = value;
      if (name === 'buyer.lastName') updatedAttendee.lastName = value;
      if (name === 'buyer.email') updatedAttendee.email = value;
      if (name === 'buyer.phoneNumber') updatedAttendee.phoneNumber = value;
      if (name === 'buyer.company') updatedAttendee.company = value;

      update(index, { ...updatedAttendee, ticket: updatedAttendee.ticket });
    }

    setValue(name, value, { shouldValidate: true });
  };

  const copyCompanyName = () => {
    const companyName = getValues('buyer.company');
    fields.forEach((field, index) => {
      setValue(`attendees.${index}.company`, companyName, { shouldValidate: true });
    });
  };

  const removeTicket = async (item) => {
    try {
      const ticket = data.cartItem.find((a) => a.ticketType.id === item);
      const res = await axiosInstance.post(endpoints.cart.removeTicket, { ticket });
      mutate();
      toast.success(res?.data?.message);
    } catch (error) {
      toast.error('Failed to remove');
    }
  };

  const helperText = (
    <Stack spacing={0.5} color="text.secondary" my={2}>
      <Stack direction="row" alignItems="center" spacing={1}>
        <Iconify icon="material-symbols:mail-outline" width={24} />
        <Typography variant="caption">
          Your ticket(s) will be sent to your provided email address.
        </Typography>
      </Stack>
      <Stack direction="row" alignItems="center" spacing={1}>
        <Iconify icon="ic:baseline-whatsapp" width={24} />
        <Typography variant="caption">
          Information regarding the event will be sent to your WhatsApp.
        </Typography>
      </Stack>
    </Stack>
  );

  const buyerInfo = (
    <Stack spacing={1}>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        onMouseDown={(e) => {
          e.currentTarget.style.position = 'relative';
          e.currentTarget.style.top = '1px';
        }}
        onMouseUp={(e) => {
          e.currentTarget.style.position = '';
        }}
        onClick={(e) => {
          e.stopPropagation();
          collapse.onToggle();
        }}
        sx={{
          cursor: 'pointer',
          p: 1.5,
          borderRadius: 2,
          transition: 'all .1s',
          transitionTimingFunction: 'linear',
          '&:hover': {
            bgcolor: (theme) => theme.palette.divider,
          },
        }}
      >
        <Typography variant="subtitle1">Buyer&apos;s information</Typography>
        <IconButton>
          {collapse.value ? (
            <Iconify icon="ep:arrow-down-bold" width={20} />
          ) : (
            <Iconify icon="ep:arrow-right-bold" width={20} />
          )}
        </IconButton>
      </Stack>

      <Collapse in={collapse.value} timeout="auto" unmountOnExit>
        <Box
          display="grid"
          gridTemplateColumns={{ xs: 'repeat(1,1fr)', md: 'repeat(2,1fr)' }}
          gap={2}
        >
          <TextFieldCustom
            name="buyer.firstName"
            label="First Name"
            onChange={onChangeInputBuyer}
          />
          <TextFieldCustom name="buyer.lastName" label="Last Name" onChange={onChangeInputBuyer} />
          <TextFieldCustom name="buyer.email" label="Email" onChange={onChangeInputBuyer} />
          <TextFieldCustom
            name="buyer.phoneNumber"
            label="Phone Number"
            inputMode="decimal"
            onChange={onChangeInputBuyer}
          />
          <Stack direction="row" spacing={1} alignItems="center">
            <TextFieldCustom name="buyer.company" label="Company" onChange={onChangeInputBuyer} />
            <Button variant="text" size="small" onClick={copyCompanyName}>
              Copy
            </Button>
          </Stack>
          {buyer && (
            <RHFSelect
              name="buyer.ticket"
              label="For which ticket?"
              onChange={(e) => handleChangeTicket(e.target.value)}
              sx={{
                '& .MuiInputBase-root': {
                  '& fieldset': {
                    borderColor: '#DFDFDF', // Change the border color here
                  },
                  borderRadius: 0.5,
                },
                '& .MuiInputLabel-root': {
                  color: '#707070',
                },
              }}
            >
              <MenuItem disabled value="">
                <em>Select an option</em>
              </MenuItem>
              {ticketTypes?.map((ticket) => (
                <MenuItem key={ticket.id} value={ticket.ticketType.id}>
                  {ticket.ticketType.title}
                </MenuItem>
              ))}
            </RHFSelect>
          )}
        </Box>

        {helperText}

        <RHFCheckbox
          name="buyer.isAnAttendee"
          label="I am also an attendee"
          onChange={(_, val) => handleBuyerCheckbox(val)}
          sx={{
            '&.Mui-checked': {
              color: 'black',
            },
          }}
        />
      </Collapse>
    </Stack>
  );

  const attendeeinfo = (
    <Stack spacing={1}>
      <Typography variant="subtitle1">Attendee&apos;s information</Typography>

      <Stack spacing={2}>
        {fields.map((field, index) => (
          <Box key={field.id}>
            <Stack
              id={field.id}
              component="div"
              onMouseDown={(e) => {
                e.currentTarget.style.position = 'relative';
                e.currentTarget.style.top = '1px';
              }}
              onMouseUp={(e) => {
                e.currentTarget.style.position = '';
              }}
              mb={1}
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              onClick={(e) => {
                e.stopPropagation();
                toggleCollapse(index);
              }}
              sx={{
                cursor: 'pointer',
                p: 1.5,
                borderRadius: 2,
                transition: 'all .1s',
                transitionTimingFunction: 'linear',
                '&:hover': {
                  bgcolor: (theme) => theme.palette.divider,
                },
              }}
            >
              <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap">
                <Typography variant="subtitle2" color="text.secondary">
                  Attendee {index + 1}
                </Typography>
                <Stack direction="row" alignItems="center" flexWrap="wrap" spacing={1}>
                  <Label color="info">
                    <Iconify icon="mingcute:ticket-line" width={20} mr={1} />
                    {field.ticket.title}
                  </Label>
                  {field.isForbuyer && <Label color="success">Buyer&apos;s ticket</Label>}
                </Stack>
              </Stack>

              <Stack direction="row" spacing={1}>
                <Tooltip title="Remove ticket">
                  <IconButton
                    color="error"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeTicket(field.ticket.id);
                    }}
                  >
                    <Iconify icon="mdi:trash" width={20} />
                  </IconButton>
                </Tooltip>

                <IconButton>
                  {collapseAttendees.includes(index) ? (
                    <Iconify icon="ep:arrow-down-bold" width={20} />
                  ) : (
                    <Iconify icon="ep:arrow-right-bold" width={20} />
                  )}
                </IconButton>
              </Stack>
            </Stack>

            <Collapse in={collapseAttendees.includes(index)} timeout="auto" unmountOnExit>
              <Box
                display="grid"
                gridTemplateColumns={{ xs: 'repeat(1,1fr)', md: 'repeat(2,1fr)' }}
                gap={2}
              >
                <TextFieldCustom
                  name={`attendees.${index}.firstName`}
                  label="First Name"
                  slotProps={
                    getValues(`attendees.${index}.isForbuyer`) && {
                      input: {
                        readOnly: true,
                      },
                    }
                  }
                />
                <TextFieldCustom
                  name={`attendees.${index}.lastName`}
                  label="Last Name"
                  slotProps={
                    getValues(`attendees.${index}.isForbuyer`) && {
                      input: {
                        readOnly: true,
                      },
                    }
                  }
                />
                <TextFieldCustom
                  name={`attendees.${index}.email`}
                  label="Email"
                  slotProps={
                    getValues(`attendees.${index}.isForbuyer`) && {
                      input: {
                        readOnly: true,
                      },
                    }
                  }
                />
                <TextFieldCustom
                  name={`attendees.${index}.phoneNumber`}
                  label="Phone Number"
                  inputMode="decimal"
                  slotProps={
                    getValues(`attendees.${index}.isForbuyer`) && {
                      input: {
                        readOnly: true,
                      },
                    }
                  }
                />
                <TextFieldCustom
                  name={`attendees.${index}.company`}
                  label="Company"
                  slotProps={
                    getValues(`attendees.${index}.isForbuyer`) && {
                      input: {
                        readOnly: true,
                      },
                    }
                  }
                />
              </Box>
            </Collapse>

            {index < fields.length - 1 && (
              <Divider
                sx={{
                  mt: 3,
                  mb: 2,
                }}
              />
            )}
          </Box>
        ))}
      </Stack>
    </Stack>
  );

  const scrollToTop = () => {
    const el = ref.current;
    if (!el) return;
    el.scrollTop = 0;
  };

  useEffect(() => {
    if (!data?.cartItem?.length) return;

    const result = data.cartItem.flatMap((item) =>
      Array.from({ length: item.quantity }, () => ({
        ticket: item.ticketType,
        ...defaultAttendee,
      }))
    );

    setValue('attendees', result);
  }, [data, setValue]);

  useEffect(() => {
    const el = ref?.current;
    if (!el) return;

    const handleScroll = () => {
      if (!ref.current) return;
      // checkOverflow();
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

  useEffect(() => {
    const parent = ref.current;
    if (!parent) return;

    const checkActiveSection = () => {
      let currentActiveId = null;

      fields.forEach((field) => {
        const el = document.getElementById(field.id);
        if (el) {
          const elRect = el.getBoundingClientRect();
          const parentRect = parent.getBoundingClientRect();

          if (elRect.top <= parentRect.top + 10) {
            currentActiveId = field.id;
          }
        }
      });

      setActiveFieldId(currentActiveId);
    };

    parent.addEventListener('scroll', checkActiveSection);
    checkActiveSection(); // Run once on mount

    // eslint-disable-next-line consistent-return
    return () => {
      parent.removeEventListener('scroll', checkActiveSection);
    };
  }, [fields]);

  useLayoutEffect(() => {
    if (!boxRef.current) return;
    const overviewBox = boxRef.current;

    const handleClick = (event) => {
      if (!overviewBox.contains(event.target)) {
        anotherCollapse.onFalse();
      }
    };

    document.addEventListener('click', handleClick);

    // eslint-disable-next-line consistent-return
    return () => {
      document.removeEventListener('click', handleClick);
    };
  }, [anotherCollapse]);

  if (cartLoading) {
    <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
      <CircularProgress
        thickness={7}
        size={25}
        sx={{
          color: (theme) => theme.palette.common.black,
          strokeLinecap: 'round',
        }}
      />
    </Box>;
  }

  return (
    <Box
      sx={{
        height: 1,
        borderRadius: 2,
        overflow: 'hidden',
        p: 2,
      }}
    >
      <ListItemText
        primary="Billing Information"
        secondary="Personal and contact information of the buyer."
        primaryTypographyProps={{ variant: 'subtitle1' }}
        secondaryTypographyProps={{ variant: 'caption' }}
      />
      <Box
        ref={ref}
        flexGrow={1}
        sx={{
          px: 2,
          my: 2,
          height: 'calc(100vh - 30vh)',
          overflowY: 'auto',
          overflowX: 'hidden',
          scrollbarWidth: 'thin',
          scrollBehavior: 'smooth',
        }}
      >
        {isCartExpired && 'Expired already'}

        {buyerInfo}
        <Divider sx={{ my: 2 }} />
        {attendeeinfo}

        <IconButton
          size="small"
          sx={{
            position: 'absolute',
            bottom: 10,
            right: 10,
            display: isOverflow.value && 'none',
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

      {fields?.length && (
        <Stack sx={{ color: 'black', position: 'absolute', top: 100, left: -100 }}>
          {fields.map((field, index) => (
            <Typography
              key={index}
              variant="caption"
              color="text.secondary"
              sx={{
                cursor: 'pointer',
                ...(activeFieldId === field.id && {
                  position: 'relative',
                  left: 4,
                  color: 'black',
                  fontWeight: 600,
                }),
                '&:hover': {
                  color: alpha('#000000', 1),
                },
              }}
              onClick={(e) => {
                const s = document.getElementById(field.id);

                if (s) {
                  s.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  setActiveFieldId(field.id);
                }
              }}
            >
              {field.isForbuyer ? "Buyer's Ticket" : `Attendee ${index + 1}`}
            </Typography>
          ))}
        </Stack>
      )}

      {mdDown && (
        <Box
          ref={boxRef}
          p={1}
          mt="auto"
          boxShadow={10}
          sx={{
            borderTop: 1.5,
            borderColor: (theme) => theme.palette.divider,
          }}
        >
          <>
            <Collapse in={anotherCollapse.value} timeout="auto">
              <Box sx={{ height: '55vh', p: 1 }} position="relative">
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
                  flex={1}
                  justifyContent="space-between"
                >
                  <Box>
                    <Stack spacing={2}>
                      {data?.cartItem.map((item) => (
                        <Stack
                          key={item.id}
                          direction="row"
                          alignItems="center"
                          justifyContent="space-between"
                        >
                          <Typography>{`${item.quantity} x ${item.ticketType.title}`}</Typography>
                          <Typography>
                            {Intl.NumberFormat('en-MY', {
                              style: 'currency',
                              currency: 'MYR',
                            }).format(item.quantity * item.ticketType.price)}
                          </Typography>
                        </Stack>
                      ))}
                    </Stack>
                  </Box>

                  <Stack spacing={2}>
                    {data && (
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

                        {!!data.discount && (
                          <Stack maxWidth={200} spacing={1}>
                            <Stack direction="row" spacing={0.5} alignItems="center">
                              <Iconify
                                icon="lets-icons:check-fill"
                                color="success.main"
                                width={13}
                              />
                              <Typography variant="caption" fontSize={12} color="success">
                                Discount code applied
                              </Typography>
                            </Stack>
                            <Stack direction="row" justifyContent="space-between">
                              <Typography variant="caption" fontSize={12}>
                                {data.discount.code}
                              </Typography>
                              <Typography variant="caption" color="error" fontSize={12}>
                                - {data.discount.value}
                              </Typography>
                            </Stack>
                          </Stack>
                        )}
                      </Stack>
                    )}

                    <Divider />

                    <Stack
                      direction="row"
                      alignItems="center"
                      gap={10}
                      justifyContent="space-between"
                    >
                      <Typography>Subtotal:</Typography>
                      <Typography>
                        {Intl.NumberFormat('en-MY', {
                          style: 'currency',
                          currency: 'MYR',
                        }).format(subTotal)}
                      </Typography>
                    </Stack>

                    {data && (
                      <Stack
                        direction="row"
                        alignItems="center"
                        gap={10}
                        justifyContent="space-between"
                      >
                        <Typography>Discount</Typography>
                        <Typography>
                          -{' '}
                          {Intl.NumberFormat('en-MY', {
                            style: 'currency',
                            currency: 'MYR',
                          }).format(data?.orderSummary?.discount)}
                        </Typography>
                      </Stack>
                    )}

                    <Stack
                      direction="row"
                      alignItems="center"
                      gap={10}
                      justifyContent="space-between"
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
                        }).format(
                          data?.orderSummary?.totalPrice
                            ? data.orderSummary.totalPrice + 11.94
                            : subTotal + 11.94
                        )}
                      </Typography>
                    </Stack>
                  </Stack>
                </Stack>
              </Box>
            </Collapse>

            <Box my={1} onClick={() => anotherCollapse.onToggle()}>
              <Stack direction="row" alignItems="center" justifyContent="end" spacing={2}>
                {anotherCollapse.value ? (
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
                    data?.orderSummary?.totalPrice && data.orderSummary.totalPrice + 11.94
                  )}
                </Typography>
              </Stack>
            </Box>
          </>

          <LoadingButton
            size="large"
            variant="contained"
            fullWidth
            type="submit"
            // loading={loading.value}
            // onClick={handleCheckout}
            // disabled={!totalTicketsQuantitySelected}
            startIcon={
              <Iconify icon="material-symbols-light:shopping-cart-checkout-rounded" width={22} />
            }
          >
            Proceed to payment
          </LoadingButton>
        </Box>
      )}
    </Box>
  );
};

export default TicketInformationCard;

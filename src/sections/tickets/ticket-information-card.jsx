import useSWR from 'swr';
import dayjs from 'dayjs';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm, useFieldArray } from 'react-hook-form';
import React, { useRef, useMemo, useState, useEffect } from 'react';

import {
  Box,
  Stack,
  alpha,
  Divider,
  MenuItem,
  Collapse,
  Typography,
  IconButton,
  ListItemText,
  CircularProgress,
} from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { fetcher } from 'src/utils/axios';

import Image from 'src/components/image';
import Label from 'src/components/label';
import Iconify from 'src/components/iconify';
import FormProvider, { RHFSelect, RHFCheckbox } from 'src/components/hook-form';

import { TextFieldCustom } from './components/text-field';

const schema = yup.object().shape({
  buyer: yup.object().shape({
    firstName: yup.string().required('First name is required'),
    lastName: yup.string().required('Last name is required'),
    email: yup.string().email('Must be a valid email').required('Email is required'),
    phoneNumber: yup.string().required('Phone number is required'),
    company: yup.string().required('Company name is required'),
    isAnAttendee: yup.boolean(),
    ticket: yup.string().when('isAnAttendee', {
      is: (y) => y.val,
      then: (y) => y.string().required('Ticket type is required'),
    }),
  }),
  attendees: yup.array().of(
    yup.object().shape({
      firstName: yup.string().required('First name is required'),
      lastName: yup.string().required('Last name is required'),
      email: yup.string().required('Email is required'),
      phoneNumber: yup.string().required('Phone number is required'),
      company: yup.string().required('Company name is required'),
    })
  ),
});

const defaultAttendee = {
  firstName: '',
  lastName: '',
  email: '',
  phoneNumber: '',
  company: '',
  isCollapse: false,
};

const TicketInformationCard = () => {
  // const { data } = useGetCartData();
  const collapse = useBoolean();
  const ref = useRef();

  const isOverflow = useBoolean();
  const [activeFieldId, setActiveFieldId] = useState(null);

  const [lastRemoved, setLastRemoved] = useState(null);

  const { data, isLoading: cartLoading } = useSWR('/api/cart/', fetcher);

  const isCartExpired = useMemo(() => dayjs(data.expiryDate).isBefore(dayjs(), 'date'), [data]);

  const ticketTypes = useMemo(() => data?.cartItem, [data]);

  const methods = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      buyer: {
        firstName: '',
        lastName: '',
        email: '',
        phoneNumber: '',
        company: '',
        isAnAttendee: false,
        ticket: '',
      },
      attendees: [],
    },
    mode: 'onChange',
    reValidateMode: 'onChange',
  });

  const { watch, control, setValue, getValues } = methods;

  const buyer = watch('buyer');
  const attendees = watch('attendees');

  const toggleCollapse = (index) => {
    setValue(`attendees.${index}.isCollapse`, !attendees[index].isCollapse);
  };

  const { fields } = useFieldArray({
    control,
    name: 'attendees',
  });

  const handleChangeTicket = (value) => {
    setValue('buyer.ticket', value);

    const newAttendees = [...attendees]; // Copy the existing attendees

    if (buyer.isAnAttendee) {
      // Restore previously removed attendee if it exists
      if (lastRemoved) {
        newAttendees.push(lastRemoved);
        setLastRemoved(null); // Reset last removed after restoring
      }

      // Find the attendee with the given ticket ID
      const index = newAttendees.findIndex((attendee) => attendee.ticket.id === value);

      if (index !== -1) {
        setLastRemoved(newAttendees.splice(index, 1)[0]); // Remove and store it
      }

      setValue('attendees', newAttendees, { shouldValidate: true });
    }
  };

  const handleBuyerCheckbox = (val) => {
    setValue('buyer.isAnAttendee', val);

    if (!val) {
      setValue('buyer.ticket', '');
      const newAttendees = [...attendees, lastRemoved];

      setLastRemoved(null);
      setValue('attendees', newAttendees);
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
          <TextFieldCustom name="buyer.firstName" label="First Name" />
          <TextFieldCustom name="buyer.lastName" label="Last Name" />
          <TextFieldCustom name="buyer.email" label="Email" />
          <TextFieldCustom name="buyer.phoneNumber" label="Phone Number" inputMode="decimal" />
          <TextFieldCustom name="buyer.company" label="Company" />
          {buyer.isAnAttendee && (
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
              <Stack direction="row" alignItems="center" spacing={1}>
                <Typography variant="subtitle2" color="text.secondary">
                  Attendee {index + 1}
                </Typography>
                <Label color="info">
                  <Iconify icon="mingcute:ticket-line" width={20} mr={1} />
                  {field.ticket.title}
                </Label>
              </Stack>

              <IconButton>
                {getValues(`attendees.${index}.isCollapse`) ? (
                  <Iconify icon="ep:arrow-down-bold" width={20} />
                ) : (
                  <Iconify icon="ep:arrow-right-bold" width={20} />
                )}
              </IconButton>
            </Stack>

            <Collapse in={getValues(`attendees.${index}.isCollapse`)} timeout="auto" unmountOnExit>
              <Box
                display="grid"
                gridTemplateColumns={{ xs: 'repeat(1,1fr)', md: 'repeat(2,1fr)' }}
                gap={2}
              >
                <TextFieldCustom name={`attendees.${index}.firstName`} label="First Name" />
                <TextFieldCustom name={`attendees.${index}.lastName`} label="Last Name" />
                <TextFieldCustom name={`attendees.${index}.email`} label="Email" />
                <TextFieldCustom
                  name={`attendees.${index}.phoneNumber`}
                  label="Phone Number"
                  inputMode="decimal"
                />
                <TextFieldCustom name={`attendees.${index}.company`} label="Company" />
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

  useEffect(() => {
    if (!data?.cartItem?.length) return;

    const result = data.cartItem.flatMap((item) =>
      Array.from({ length: item.quantity }, () => ({
        ticket: item.ticketType,
        ...defaultAttendee,
        isCollapse: true,
      }))
    );

    setValue('attendees', result, { shouldValidate: true });
  }, [data, setValue, buyer]);

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

  // useEffect(() => {
  //   // ✅ Detect Active Section
  //   const observer = new IntersectionObserver(
  //     (entries) => {
  //       entries.forEach((entry) => {
  //         if (entry.isIntersecting) {
  //           setActiveFieldId(entry.target.id);
  //         }
  //       });
  //     },
  //     { threshold: 0.6 } // 60% visibility to be marked as active
  //   );

  //   fields.forEach((field) => {
  //     const element = document.getElementById(field.id);
  //     if (element) observer.observe(element);
  //   });

  //   // eslint-disable-next-line consistent-return
  //   return () => {
  //     observer.disconnect();
  //   };
  // }, [fields, isOverflow]);

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

  const scrollToTop = () => {
    const el = ref.current;
    if (!el) return;
    el.scrollTop = 0;
  };

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
    <Stack
      sx={{
        height: 1,
        borderRadius: 2,
        overflow: 'hidden',
        color: 'whitesmoke',
        bgcolor: 'white',
      }}
    >
      <Box sx={{ bgcolor: 'black', p: 2 }}>
        <Stack direction="row" alignItems="center" spacing={2}>
          <Image src="/assets/tickets/ticket-2.svg" width={20} />
          <ListItemText
            primary="Billing Information"
            secondary="Personal and contact information of the buyer."
            primaryTypographyProps={{ variant: 'subtitle1' }}
            secondaryTypographyProps={{ color: 'white', variant: 'caption' }}
          />
        </Stack>
      </Box>
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
          color: 'black',
        }}
      >
        {isCartExpired && 'Expired already'}
        <FormProvider methods={methods}>
          {buyerInfo}
          <Divider sx={{ my: 2 }} />
          {attendeeinfo}
        </FormProvider>
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

      {attendees?.length && (
        <Stack sx={{ color: 'black', position: 'absolute', top: 100, left: -100 }}>
          {fields.map((field, index) => (
            <Typography
              key={index}
              variant="caption"
              color="text.secondary"
              sx={{
                cursor: 'pointer',
                // color: activeFieldId === field.id ? 'black' : 'text.secondary',
                ...(activeFieldId === field.id && {
                  position: 'relative',
                  left: 3,
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
            >{`Attendee ${index + 1}`}</Typography>
          ))}
        </Stack>
      )}
    </Stack>
  );
};

export default TicketInformationCard;

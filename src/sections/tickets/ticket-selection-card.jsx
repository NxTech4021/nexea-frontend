// import { enqueueSnackbar } from 'notistack';
// import React, { useState, useEffect, useCallback } from 'react';

// import { Box, Typography, CircularProgress } from '@mui/material';

// import { useRouter } from 'src/routes/hooks';

// import { useResponsive } from 'src/hooks/use-responsive';

// import { debounce } from 'src/utils/debounce';
// import axiosInstance, { endpoints } from 'src/utils/axios';

// import useGetCartData from './hooks/use-get-cart';

// const fakeInfo = [
//   {
//     id: 1,
//     type: 'Standard - Startups',
//     price: 199,
//     quantity: 1,
//     subTotal: 0,
//   },
//   {
//     id: 2,
//     type: 'Standard - General',
//     price: 499,
//     quantity: 1,
//     subTotal: 0,
//   },
// ];

// const fakeDiscountCode = [
//   {
//     code: 'AFIQXNEXEA',
//     type: 'percentage',
//     value: '67%',
//   },
//   {
//     code: 'JAMESXNEXEA',
//     type: 'percentage',
//     value: '78%',
//   },
// ];

// const TicketSelectionCard = () => {
//   const smDown = useResponsive('down', 'sm');

//   const { cartSessionId, data, isLoading, mutate } = useGetCartData();

//   // const { data, isLoading, mutate } = useGetCart(cartSessionId);

//   const [timeRemaining, setTimeRemaining] = useState('');

//   const router = useRouter();

//   const [cartItems, setCartItems] = useState(data?.cartItem || []);

//   const [tickets, setTickets] = useState(fakeInfo);

//   const [discountCode, setDiscountCode] = useState('');

//   const [discount, setDiscount] = useState(null);
//   const [subTotal, setSubtotal] = useState(0); // The subtotal without discount
//   const [discountedPrice, setDiscountedPrice] = useState(0);
//   const [sst, setSST] = useState(11.94);
//   const [totalPrice, setTotalPrice] = useState(null);

//   const updateDatabase = useCallback(
//     async (id, quantity) => {
//       try {
//         await axiosInstance.post('/api/cart/changeQuantityCartItem', {
//           cartItemId: id,
//           quantity,
//         });

//         mutate();
//       } catch (error) {
//         console.log(error);
//       }
//     },
//     [mutate]
//   );

//   const debouncedUpdate = debounce(updateDatabase, 4000);

//   // User click
//   const handleIncrement = useCallback(
//     (id) => {
//       setCartItems((prev) =>
//         prev.map((item) =>
//           item.id === id
//             ? { ...item, quantity: item.quantity + 1 >= 16 ? 15 : item.quantity + 1 }
//             : item
//         )
//       );
//       setCartItems((items) => [
//         ...items.map((item) => ({ ...item, subTotal: item.ticketType.price * item.quantity })),
//       ]);

//       const { quantity } = cartItems.find((item) => item.id === id);
//       if (quantity < 15) {
//         updateDatabase(id, quantity + 1);
//       }
//     },
//     [cartItems, updateDatabase]
//   );

//   // User click
//   const handleDecrement = useCallback(
//     (id) => {
//       setCartItems((prev) =>
//         prev.map((item) =>
//           item.id === id
//             ? {
//                 ...item,
//                 quantity: item.quantity > 0 && item.quantity - 1,
//               }
//             : item
//         )
//       );
//       setCartItems((items) => [
//         ...items.map((item) => ({ ...item, subTotal: item.ticketType.price * item.quantity })),
//       ]);

//       const { quantity } = cartItems.find((item) => item.id === id);

//       updateDatabase(id, quantity - 1);

//       // debouncedUpdate(id, quantity - 1);
//     },
//     [updateDatabase, cartItems]
//   );

//   // User input manually
//   const onChangeTicketQuantity = useCallback((val, id) => {
//     if (parseInt(val, 10) >= 16) return;
//     if (Number.isNaN(val)) return;
//     setTickets((prev) =>
//       prev.map((item) =>
//         item.id === id
//           ? {
//               ...item,
//               quantity: parseInt(val, 10),
//             }
//           : item
//       )
//     );
//     setTickets((items) => [
//       ...items.map((item) => ({ ...item, subTotal: item.price * item.quantity })),
//     ]);
//   }, []);

//   // Delete if quantity is 0
//   const handleDelete = (id) => {
//     setTickets((items) => items.filter((ticket) => ticket.id !== id));
//   };

//   // User apply discount code
//   const applyDiscountCode = () => {
//     if (!tickets.length) {
//       enqueueSnackbar('Please select a ticket first', {
//         variant: 'error',
//       });
//       return;
//     }

//     if (!discountCode) {
//       enqueueSnackbar('Discount code not found.', {
//         variant: 'error',
//       });
//       return;
//     }

//     const isExist = fakeDiscountCode.find((item) => item.code === discountCode);

//     if (!isExist) {
//       enqueueSnackbar('Discount code not found.', {
//         variant: 'error',
//       });
//       return;
//     }

//     if (discount && isExist.code === discount.code) {
//       enqueueSnackbar('Discount code has been applied', {
//         variant: 'error',
//       });
//       return;
//     }

//     setDiscount(isExist);
//     setDiscountCode('');
//     enqueueSnackbar('Sucessfully applied.');
//   };

//   //   const handleTicketSelect = (ticketId) => {
//   //     setSelectedTicketId(ticketId);
//   //   };

//   // Calculate discount price and display
//   const calculateDiscountedPrice = useCallback(() => {
//     console.log('calling');
//     let discountPrice = 0;

//     if (!!discount && subTotal) {
//       discountPrice += (subTotal * parseFloat(discount.value)) / 100;
//     }

//     if (discountPrice > subTotal) {
//       setDiscountedPrice(subTotal);
//       return;
//     }

//     const price = tickets.reduce((acc, val) => acc + val.subTotal, 0);

//     setTotalPrice(price - discountPrice + 11.94);
//     setDiscountedPrice(discountPrice);
//   }, [discount, subTotal, tickets]);

//   const handleRedeemDiscount = async () => {
//     if (!discountCode) {
//       enqueueSnackbar('Please enter a discount code', { variant: 'error' });
//       return;
//     }

//     const cartSubtotal = tickets.reduce(
//       (total, ticket) => total + ticket.quantity * ticket.price,
//       0
//     );

//     const selectedTicket = tickets.find((ticket) => ticket.quantity > 0);
//     if (!selectedTicket) {
//       enqueueSnackbar('Please select at least one ticket', { variant: 'error' });
//       return;
//     }

//     const payload = {
//       code_name: discountCode,
//       cartSubtotal,
//       ticketId: selectedTicket?.id || null,
//       quantity: selectedTicket?.quantity || 0,
//     };

//     console.log('Received payload:', payload);

//     try {
//       const response = await axiosInstance.post(endpoints.discount.redeem, payload);

//       const { success, discountAmount, discountValue, discountType, message } = response.data;

//       console.log('Backend response:', response.data);

//       if (success) {
//         setDiscount({
//           code_name: discountCode,
//           value: discountValue,
//           type: discountType,
//           amount: discountAmount,
//           ticketId: selectedTicket?.id || null,
//           quantity: selectedTicket?.quantity || 0,
//           cartSubtotal,
//         });
//         setDiscountedPrice(discountAmount);
//         console.log('Discount', discount);
//         enqueueSnackbar('Discount code redeemed successfully', { variant: 'success' });
//       } else {
//         enqueueSnackbar(message || 'Failed to apply discount', { variant: 'error' });
//       }
//     } catch (err) {
//       enqueueSnackbar('Invalid Discount code', { variant: 'error' });
//     }
//   };

//   const addTicket = useCallback(
//     async (ticketTypeId) => {
//       try {
//         await axiosInstance.post(endpoints.cart.addTicket, {
//           cartSessionId,
//           ticketTypeId,
//         });
//         mutate();
//       } catch (error) {
//         enqueueSnackbar('Error adding new ticket', {
//           variant: 'error',
//         });
//       }
//     },
//     [cartSessionId, mutate]
//   );

//   useEffect(() => {
//     if (!isLoading) {
//       if (!data) {
//         // router.push(paths.auth.jwt.login);
//       } else {
//         setCartItems(
//           data.cartItem.map((cart) => ({
//             ...cart,
//             quantity: cart.quantity === 1 ? 1 : cart.quantity,
//             subTotal: cart.ticketType.price * cart.quantity,
//           }))
//         );
//       }
//     }
//   }, [data, router, isLoading]);

//   useEffect(() => {
//     const initialSubtotal = tickets.reduce(
//       (acc, ticket) => acc + ticket.quantity * ticket.price,
//       0
//     );

//     // Set the initial subtotal and total price before applying any discount
//     setSubtotal(initialSubtotal);
//     setTotalPrice(initialSubtotal + sst);
//     console.log('Initial Total:', initialSubtotal + sst);
//     // Reset the discounted price to 0 initially
//     setDiscountedPrice(0);
//   }, [tickets, sst]); // This runs whenever `tickets` change

//   useEffect(() => {
//     console.log('Discount Object:', discount);
//     if (discount && discount.value && subTotal > 0) {
//       console.log('Discount Objectss:', discount);

//       let discountAppliedToTicketSubtotal = 0;
//       let fullPriceSubtotal = 0;

//       // Loop through tickets to calculate discount per ticket
//       tickets.forEach((ticket) => {
//         if (ticket.id === discount.ticketId && discount) {
//           if (discount.type === 'percentage') {
//             // Percentage discount is already calculated in backend, use the result
//             discountAppliedToTicketSubtotal =
//               ((ticket.price * discount.value) / 100) * ticket.quantity;
//           } else if (discount.type === 'fixed') {
//             // Fixed discount is already calculated in backend, use the result
//             discountAppliedToTicketSubtotal = discount.value * ticket.quantity;
//           }
//         } else {
//           // For other tickets, keep the full price
//           fullPriceSubtotal += ticket.price * ticket.quantity;
//         }
//       });

//       // Handle fixed-order discount type, applied to the entire cart subtotal
//       let finalSubtotal = fullPriceSubtotal + discountAppliedToTicketSubtotal;

//       if (discount.type === 'fixed-order') {
//         // If it's a fixed-order discount, apply it to the whole cart subtotal
//         const appliedDiscount = Math.min(discount.value, subTotal);
//         console.log('Applied discount', appliedDiscount);
//         finalSubtotal = subTotal - appliedDiscount; // Apply the discount to the total cart amount
//       }

//       // Final subtotal after applying the discount
//       const discountedTotalPrice = finalSubtotal + sst; // Add SST to the final price

//       setDiscountedPrice(finalSubtotal); // Set the discounted subtotal
//       setTotalPrice(discountedTotalPrice); // Set the total price with SST
//     }
//   }, [discount, subTotal, tickets, sst]);

//   if (isLoading) {
//     return (
//       <Box sx={{ mx: 'auto' }}>
//         <CircularProgress
//           thickness={7}
//           size={25}
//           sx={{
//             color: (theme) => theme.palette.common.black,
//             strokeLinecap: 'round',
//           }}
//         />
//       </Box>
//     );
//   }

//   return !isLoading && <Typography>ad</Typography>;
// };
// //     !isLoading && (
// //       <Stack
// //         sx={{
// //           borderRadius: 2,
// //           overflow: 'hidden',
// //           bgcolor: 'white',
// //         }}
// //       >
// //         <Box
// //           sx={{
// //             bgcolor: 'black',
// //             p: 2,
// //             display: 'flex',
// //             justifyContent: 'space-between',
// //             alignItems: 'center',
// //             color: 'whitesmoke',
// //           }}
// //         >
// //           <Stack direction="row" alignItems="center" spacing={2}>
// //             <Image src="/assets/tickets/ticket-1.svg" width={25} />
// //             <ListItemText
// //               primary="Event Ticket"
// //               secondary="{{ event name  }}"
// //               primaryTypographyProps={{ variant: 'subtitle1' }}
// //               secondaryTypographyProps={{ color: 'white', variant: 'caption' }}
// //             />
// //           </Stack>
// //           <Typography>{`{{ event logo }}`}</Typography>
// //         </Box>

// // //         <Stack direction="row" alignItems="center" spacing={2}>
// // //           <Image src="/assets/tickets/ticket-1.svg" width={25} />
// // //           <ListItemText
// // //             primary="Event Ticket"
// // //             secondary= {eventData.name}
// // //             primaryTypographyProps={{ variant: 'subtitle1' }}
// // //             secondaryTypographyProps={{ color: 'white', variant: 'caption' }}
// // //           />
// // //         </Stack>
// // //         <Typography>{`{{ event logo }}`}</Typography>
// // //       </Box>

// //         <Box sx={{ px: 2 }}>
// //           <TableContainer>
// //             <Table>
// //               <TableHead
// //                 sx={{
// //                   '& .MuiTableCell-head': {
// //                     bgcolor: 'white',
// //                   },
// //                   borderBottom: 1,
// //                   borderBottomColor: '#EBEBEB',
// //                 }}
// //               >
// //                 {}
// //                 <TableRow>
// //                   <TableCell>Ticket Type</TableCell>
// //                   {!smDown && <TableCell align="center">Ticket Price</TableCell>}
// //                   <TableCell align="center">Quantity</TableCell>
// //                   {!smDown && <TableCell align="right">Subtotal</TableCell>}
// //                 </TableRow>
// //               </TableHead>

// //               <TableBody
// //                 sx={{
// //                   '& .MuiTableCell-body': {
// //                     border: 'none',
// //                   },
// //                   borderBottom: 1,
// //                   borderBottomColor: '#EBEBEB',
// //                 }}
// //               >
// //                 <TableRow>
// //                   {!cartItems.length && (
// //                     <TableCell colSpan={4}>
// //                       <Typography textAlign="center" variant="subtitle2" color="text.secondary">
// //                         Cart is empty
// //                       </Typography>
// //                     </TableCell>
// //                   )}
// //                 </TableRow>

// //                 {cartItems
// //                   .sort((a, b) => (dayjs(a.createdAt).isAfter(dayjs(b.createdAt)) ? 1 : -1))
// //                   .map((cart) => (
// //                     <TableRow key={cart.id} sx={{ textWrap: 'nowrap' }}>
// //                       <TableCell>
// //                         <ListItemText
// //                           primary={cart.ticketType.title}
// //                           secondary={`RM ${cart.ticketType.price}`}
// //                           secondaryTypographyProps={{
// //                             display: !smDown && 'none',
// //                           }}
// //                         />
// //                       </TableCell>
// //                       {!smDown && (
// //                         <TableCell align="center">{`RM ${cart.ticketType.price}`}</TableCell>
// //                       )}
// //                       <TableCell align="center">
// //                         {cart.quantity === 0 ? (
// //                           <Stack direction="row" alignItems="center" justifyContent="center">
// //                             <IconButton color="error" onClick={() => handleDelete(cart.id)}>
// //                               <Iconify width={15} icon="mdi-light:delete" />
// //                             </IconButton>
// //                             <IconButton onClick={() => handleIncrement(cart.id)}>
// //                               <Iconify
// //                                 icon="material-symbols:add-rounded"
// //                                 width={15}
// //                                 color="green"
// //                               />
// //                             </IconButton>
// //                           </Stack>
// //                         ) : (
// //                           <Stack direction="row" alignItems="center" justifyContent="center">
// //                             <IconButton onClick={() => handleDecrement(cart.id)}>
// //                               <Iconify icon="ic:round-minus" width={15} color="red" />
// //                             </IconButton>
// //                             <TextField
// //                               value={cart.quantity}
// //                               type="number"
// //                               variant="outlined"
// //                               size="small"
// //                               sx={{
// //                                 width: 50,
// //                                 '& input': {
// //                                   textAlign: 'center', // Center-align the text
// //                                 },
// //                               }}
// //                               onChange={(e) => onChangeTicketQuantity(e.target.value, cart.id)}
// //                             />
// //                             <IconButton onClick={() => handleIncrement(cart.id)}>
// //                               <Iconify
// //                                 icon="material-symbols:add-rounded"
// //                                 width={15}
// //                                 color="green"
// //                               />
// //                             </IconButton>
// //                           </Stack>
// //                         )}
// //                       </TableCell>
// //                       {!smDown && (
// //                         <TableCell align="right" sx={{ width: 1 / 8 }}>
// //                           RM {parseFloat(cart.subTotal).toFixed(2)}
// //                         </TableCell>
// //                       )}
// //                     </TableRow>
// //                   ))}
// //                 <TableRow>
// //                   <TableCell>
// //                     <FormControl sx={{ minWidth: 150 }} size="small">
// //                       <InputLabel id="demo-select-small-label">Ticket Type</InputLabel>
// //                       <Select
// //                         labelId="demo-select-small-label"
// //                         id="demo-select-small"
// //                         label="Ticket Type"
// //                         onChange={(e) => addTicket(e.target.value)}
// //                       >
// //                         <MenuItem value="">
// //                           <em>Select Ticket</em>
// //                         </MenuItem>
// //                         {!!data.event.ticketType &&
// //                           data.event.ticketType
// //                             .filter((ticket) =>
// //                               cartItems.every((item) => item.ticketTypeId !== ticket.id)
// //                             )
// //                             .map((ticket) => (
// //                               <MenuItem key={ticket.id} value={ticket.id}>
// //                                 {ticket.title}
// //                               </MenuItem>
// //                             ))}
// //                       </Select>
// //                     </FormControl>
// //                     {/* <Button size="small" variant="outlined" sx={{ fontSize: 12 }}>
// //                       Add more ticket
// //                     </Button> */}
// //                   </TableCell>
// //                 </TableRow>

// //                 {/* {tickets.map((ticket) => (
// //                   <TableRow key={ticket.id} sx={{ textWrap: 'nowrap' }}>
// //                     <TableCell>
// //                       <ListItemText
// //                         primary={ticket.type}
// //                         secondary={`RM ${ticket.price}`}
// //                         secondaryTypographyProps={{
// //                           display: !smDown && 'none',
// //                         }}
// //                       />
// //                     </TableCell>
// //                     {!smDown && <TableCell align="center">{`RM ${ticket.price}`}</TableCell>}
// //                     <TableCell align="center">
// //                       {ticket.quantity === 0 ? (
// //                         <Stack direction="row" alignItems="center" justifyContent="center">
// //                           <IconButton color="error" onClick={() => handleDelete(ticket.id)}>
// //                             <Iconify width={15} icon="mdi-light:delete" />
// //                           </IconButton>
// //                           <IconButton onClick={() => handleIncrement(ticket.id)}>
// //                             <Iconify icon="material-symbols:add-rounded" width={15} color="green" />
// //                           </IconButton>
// //                         </Stack>
// //                       ) : (
// //                         <Stack direction="row" alignItems="center" justifyContent="center">
// //                           <IconButton onClick={() => handleDecrement(ticket.id)}>
// //                             <Iconify icon="ic:round-minus" width={15} color="red" />
// //                           </IconButton>
// //                           <TextField
// //                             value={ticket.quantity}
// //                             type="number"
// //                             variant="outlined"
// //                             size="small"
// //                             sx={{
// //                               width: 50,
// //                               '& input': {
// //                                 textAlign: 'center', // Center-align the text
// //                               },
// //                             }}
// //                             onChange={(e) => onChangeTicketQuantity(e.target.value, ticket.id)}
// //                           />
// //                           <IconButton onClick={() => handleIncrement(ticket.id)}>
// //                             <Iconify icon="material-symbols:add-rounded" width={15} color="green" />
// //                           </IconButton>
// //                         </Stack>
// //                       )}
// //                     </TableCell>
// //                     {!smDown && (
// //                       <TableCell align="right" sx={{ width: 1 / 8 }}>
// //                         RM {parseFloat(ticket.subTotal).toFixed(2)}
// //                       </TableCell>
// //                     )}
// //                   </TableRow>
// //                 ))} */}
// //               </TableBody>
// //             </Table>
// //           </TableContainer>
// //           </Box>
// // //              {tickets.length > 0 &&
// // //                 tickets.map((ticket) => (
// // //                   <TableRow key={ticket.id}>
// // //                     <TableCell>{ticket.type}</TableCell>
// // //                     <TableCell align="center">{`RM ${ticket.price}`}</TableCell>
// // //                     <TableCell align="center">
// // //                     <Stack direction="row" alignItems="center" justifyContent="center">
// // //                       <IconButton onClick={() => handleDecrement(ticket.id)}>
// // //                         <Iconify icon="ic:round-minus" width={15} color="red" />
// // //                       </IconButton>
// // //                       <TextField
// // //                         value={ticket.quantity}
// // //                         type="number"
// // //                         variant="outlined"
// // //                         size="small"
// // //                         sx={{
// // //                           width: 50,
// // //                           '& input': {
// // //                             textAlign: 'center',
// // //                           },
// // //                         }}
// // //                         inputProps={{ readOnly: true }}
// // //                       />
// // //                       <IconButton onClick={() => handleIncrement(ticket.id)}>
// // //                         <Iconify icon="material-symbols:add-rounded" width={15} color="green" />
// // //                       </IconButton>
// // //                     </Stack>
// // //                   </TableCell>

// // //                     <TableCell align="right">
// // //                       RM {parseFloat((ticket.quantity * ticket.price).toFixed(2))}
// // //                     </TableCell>
// // //                   </TableRow>
// // //                 ))}

// // //               </TableBody>
// // //             </Table>
// // //           </TableContainer>
// // //         </Box>

// // //         <Stack
// // //           my={2}
// // //           direction={{ md: 'row' }}
// // //           justifyContent="space-between"
// // //           alignItems="start"
// // //           gap={3}
// // //         >
// // //           <Stack width={1} spacing={1}>
// // //             <Stack direction="row" alignItems="center" spacing={1}>
// // //               <TextField
// // //                 size="small"
// // //                 placeholder="Enter Discount Code"
// // //                 value={discountCode}
// // //                 onChange={(e) => setDiscountCode(e.target.value.toUpperCase().split(' ').join(''))}
// // //               />
// // //               <Button variant="contained" size="small" onClick={handleRedeemDiscount}>
// // //                 Apply
// // //               </Button>
// // //             </Stack>
// // //             {!!discount && (
// // //               <Stack maxWidth={200} spacing={1}>
// // //                 <Stack direction="row" spacing={0.5} alignItems="center">
// // //                   <Iconify icon="lets-icons:check-fill" color="success.main" width={13} />
// // //                   <Typography variant="caption" fontSize={12} color="success">
// // //                     Discount code applied
// // //                   </Typography>
// // //                 </Stack>
// // //                 <Stack direction="row" justifyContent="space-between">
// // //                   <Typography variant="caption" fontSize={12}>
// // //                     {discount.code_name}
// // //                   </Typography>
// // //                   <Typography variant="caption" color="error" fontSize={12}>
// // //                    - {discount.value} {discount.type === 'percentage' ? '%' : 'RM'}
// // //                   </Typography>
// // //                 </Stack>
// // //               </Stack>
// // //             )}
// // //           </Stack>

// //           <Stack
// //             my={2}
// //             direction={{ md: 'row' }}
// //             justifyContent="space-between"
// //             alignItems="start"
// //             gap={3}
// //           >
// //             <Stack width={1} spacing={1}>
// //               <Stack direction="row" alignItems="center" spacing={1}>
// //                 <TextField
// //                   size="small"
// //                   placeholder="Enter Discount Code"
// //                   value={discountCode}
// //                   onChange={(e) =>
// //                     setDiscountCode(e.target.value.toUpperCase().split(' ').join(''))
// //                   }
// //                 />
// //                 <Button
// //                   variant="contained"
// //                   size="small"
// //                   onClick={applyDiscountCode}
// //                   sx={{ height: 36 }}
// //                 >
// //                   Apply
// //                 </Button>
// //               </Stack>

// //               {!!discount && (
// //                 <Stack maxWidth={200} spacing={1}>
// //                   <Stack direction="row" spacing={0.5} alignItems="center">
// //                     <Iconify icon="lets-icons:check-fill" color="success.main" width={13} />
// //                     <Typography variant="caption" fontSize={12} color="success">
// //                       Discount code applied
// //                     </Typography>
// //                   </Stack>
// //                   <Stack direction="row" justifyContent="space-between">
// //                     <Typography variant="caption" fontSize={12}>
// //                       {discount.code}
// //                     </Typography>
// //                     <Typography variant="caption" color="error" fontSize={12}>
// //                       - {discount.value}
// //                     </Typography>
// //                   </Stack>
// //                 </Stack>
// //               )}
// //             </Stack>

// //             <Stack
// //               sx={{
// //                 '& .MuiTypography-root': {
// //                   fontSize: 14,
// //                   fontWeight: 500,
// //                 },
// //                 textWrap: 'nowrap',
// //               }}
// //               width={1}
// //               spacing={1}
// //               flexShrink={2}
// //             >
// //               <Stack direction="row" alignItems="center" gap={10} justifyContent="space-between">
// //                 <Typography>Subtotal:</Typography>
// //                 <Typography>RM {subTotal}.00</Typography>
// //               </Stack>
// //               <Stack direction="row" alignItems="center" gap={10} justifyContent="space-between">
// //                 <Typography>Discount</Typography>
// //                 <Typography>RM {parseFloat(discountedPrice).toFixed(2)}</Typography>
// //               </Stack>
// //               <Stack direction="row" alignItems="center" gap={10} justifyContent="space-between">
// //                 <Typography>SST:</Typography>
// //                 <Typography>RM 11.94</Typography>
// //               </Stack>
// //               <Divider />
// //               <Stack direction="row" alignItems="center" gap={10} justifyContent="space-between">
// //                 <Typography sx={{ fontWeight: 800 }}>Total:</Typography>
// //                 <Typography>
// //                   RM{' '}
// //                   {subTotal > 0
// //                     ? parseFloat(totalPrice).toFixed(2)
// //                     : parseFloat(subTotal).toFixed(2)}
// //                 </Typography>
// //               </Stack>
// // //             <Stack direction="row" alignItems="center" gap={10} justifyContent="space-between">
// // //               <Typography>Subtotal:</Typography>
// // //               <Typography>RM {parseFloat(subTotal).toFixed(2)}</Typography>
// // //             </Stack>
// // //             <Stack direction="row" alignItems="center" gap={10} justifyContent="space-between">
// // //               <Typography>Discount:</Typography>
// // //               {discount && discount.amount ? (
// // //                 <Typography>
// // //                   RM {discount.amount}
// // //                 </Typography>
// // //               ) : (
// // //                 <Typography>RM 0.00</Typography>
// // //               )}
// // //             </Stack>
// // //             <Stack direction="row" alignItems="center" gap={10} justifyContent="space-between">
// // //               <Typography>SST:</Typography>
// // //               <Typography>{sst}</Typography>
// // //             </Stack>
// // //             <Divider />
// // //             <Stack direction="row" alignItems="center" gap={10} justifyContent="space-between">
// // //               <Typography sx={{ fontWeight: 800 }}>Total:</Typography>
// // //               <Typography>
// // //                 RM{' '}
// // //                 {subTotal > 0
// // //                   ? parseFloat(totalPrice).toFixed(2)
// // //                   : parseFloat(subTotal).toFixed(2)} {/* Display Total Price */}
// // //               </Typography>
// //             </Stack>
// //           </Stack>
// //         </Box>
// //       </Stack>
// //     )

// export default TicketSelectionCard;
import dayjs from 'dayjs';
import { enqueueSnackbar } from 'notistack';
import React, { useState, useEffect, useCallback } from 'react';

import {
  Box,
  Stack,
  Table,
  Button,
  Select,
  Divider,
  TableRow,
  MenuItem,
  TableHead,
  TableCell,
  TableBody,
  TextField,
  Typography,
  IconButton,
  InputLabel,
  FormControl,
  ListItemText,
  TableContainer,
  CircularProgress,
} from '@mui/material';

import { useRouter } from 'src/routes/hooks';

import { useResponsive } from 'src/hooks/use-responsive';

import { debounce } from 'src/utils/debounce';
import axiosInstance, { endpoints } from 'src/utils/axios';

import Image from 'src/components/image';
import Iconify from 'src/components/iconify';

import useGetCartData from './hooks/use-get-cart';

const fakeInfo = [
  {
    id: 1,
    type: 'Standard - Startups',
    price: 199,
    quantity: 1,
    subTotal: 0,
  },
  {
    id: 2,
    type: 'Standard - General',
    price: 499,
    quantity: 1,
    subTotal: 0,
  },
];

const fakeDiscountCode = [
  {
    code: 'AFIQXNEXEA',
    type: 'percentage',
    value: '67%',
  },
  {
    code: 'JAMESXNEXEA',
    type: 'percentage',
    value: '78%',
  },
];

const TicketSelectionCard = () => {
  const smDown = useResponsive('down', 'sm');

  const { cartSessionId, data, isLoading, mutate } = useGetCartData();

  // const { data, isLoading, mutate } = useGetCart(cartSessionId);

  const [timeRemaining, setTimeRemaining] = useState('');

  const router = useRouter();

  const [cartItems, setCartItems] = useState(data?.cartItem || []);

  const [tickets, setTickets] = useState(fakeInfo);

  const [totalPrice, setTotalPrice] = useState(null);

  const [subTotal, setSubtotal] = useState(0);

  const [discountCode, setDiscountCode] = useState('');

  const [discountedPrice, setDiscountedPrice] = useState(0);

  const [discount, setDiscount] = useState(null);

  const updateDatabase = useCallback(
    async (id, quantity) => {
      try {
        await axiosInstance.post('/api/cart/changeQuantityCartItem', {
          cartItemId: id,
          quantity,
        });

        mutate();
      } catch (error) {
        console.log(error);
      }
    },
    [mutate]
  );

  const debouncedUpdate = debounce(updateDatabase, 4000);

  // User click
  const handleIncrement = useCallback(
    (id) => {
      setCartItems((prev) =>
        prev.map((item) =>
          item.id === id
            ? { ...item, quantity: item.quantity + 1 >= 16 ? 15 : item.quantity + 1 }
            : item
        )
      );
      setCartItems((items) => [
        ...items.map((item) => ({ ...item, subTotal: item.ticketType.price * item.quantity })),
      ]);

      const { quantity } = cartItems.find((item) => item.id === id);
      if (quantity < 15) {
        updateDatabase(id, quantity + 1);
      }
    },
    [cartItems, updateDatabase]
  );

  // User click
  const handleDecrement = useCallback(
    (id) => {
      setCartItems((prev) =>
        prev.map((item) =>
          item.id === id
            ? {
                ...item,
                quantity: item.quantity > 0 && item.quantity - 1,
              }
            : item
        )
      );
      setCartItems((items) => [
        ...items.map((item) => ({ ...item, subTotal: item.ticketType.price * item.quantity })),
      ]);

      const { quantity } = cartItems.find((item) => item.id === id);

      updateDatabase(id, quantity - 1);

      // debouncedUpdate(id, quantity - 1);
    },
    [updateDatabase, cartItems]
  );

  // User input manually
  const onChangeTicketQuantity = useCallback((val, id) => {
    if (parseInt(val, 10) >= 16) return;
    if (Number.isNaN(val)) return;
    setTickets((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              quantity: parseInt(val, 10),
            }
          : item
      )
    );
    setTickets((items) => [
      ...items.map((item) => ({ ...item, subTotal: item.price * item.quantity })),
    ]);
  }, []);

  // Delete if quantity is 0
  const handleDelete = (id) => {
    setTickets((items) => items.filter((ticket) => ticket.id !== id));
  };

  // User apply discount code
  const applyDiscountCode = () => {
    if (!tickets.length) {
      enqueueSnackbar('Please select a ticket first', {
        variant: 'error',
      });
      return;
    }

    if (!discountCode) {
      enqueueSnackbar('Discount code not found.', {
        variant: 'error',
      });
      return;
    }

    const isExist = fakeDiscountCode.find((item) => item.code === discountCode);

    if (!isExist) {
      enqueueSnackbar('Discount code not found.', {
        variant: 'error',
      });
      return;
    }

    if (discount && isExist.code === discount.code) {
      enqueueSnackbar('Discount code has been applied', {
        variant: 'error',
      });
      return;
    }

    setDiscount(isExist);
    setDiscountCode('');
    enqueueSnackbar('Sucessfully applied.');
  };

  // Calculate discount price and display
  const calculateDiscountedPrice = useCallback(() => {
    console.log('calling');
    let discountPrice = 0;

    if (!!discount && subTotal) {
      discountPrice += (subTotal * parseFloat(discount.value)) / 100;
    }

    if (discountPrice > subTotal) {
      setDiscountedPrice(subTotal);
      return;
    }

    const price = tickets.reduce((acc, val) => acc + val.subTotal, 0);

    setTotalPrice(price - discountPrice + 11.94);
    setDiscountedPrice(discountPrice);
  }, [discount, subTotal, tickets]);

  // Calculate price for total tickets
  useEffect(() => {
    const price = tickets.reduce((acc, val) => acc + val.subTotal, 0);
    setSubtotal(price);

    setTotalPrice(price + 11.94);
  }, [tickets, subTotal]);

  // Calculate subtotal for each ticket
  useEffect(() => {
    setTickets((items) => [
      ...items.map((item) => ({ ...item, subTotal: item.price * item.quantity })),
    ]);
  }, []);

  useEffect(() => {
    calculateDiscountedPrice();
  }, [calculateDiscountedPrice]);

  useEffect(() => {
    if (!isLoading) {
      if (!data) {
        // router.push(paths.auth.jwt.login);
      } else {
        setCartItems(
          data.cartItem.map((cart) => ({
            ...cart,
            quantity: cart.quantity === 1 ? 1 : cart.quantity,
            subTotal: cart.ticketType.price * cart.quantity,
          }))
        );
      }
    }
  }, [data, router, isLoading]);

  const addTicket = useCallback(
    async (ticketTypeId) => {
      try {
        await axiosInstance.post(endpoints.cart.addTicket, {
          cartSessionId,
          ticketTypeId,
        });
        mutate();
      } catch (error) {
        enqueueSnackbar('Error adding new ticket', {
          variant: 'error',
        });
      }
    },
    [cartSessionId, mutate]
  );

  // Apply discount code function that update the db in backend
  const handleRedeemDiscount = async () => {
    if (!discountCode) {
      enqueueSnackbar('Please enter a discount code', { variant: 'error' });
      return;
    }

    const cartSubtotal = tickets.reduce(
      (total, ticket) => total + ticket.quantity * ticket.price,
      0
    );

    const selectedTicket = tickets.find((ticket) => ticket.quantity > 0);
    if (!selectedTicket) {
      enqueueSnackbar('Please select at least one ticket', { variant: 'error' });
      return;
    }

    const payload = {
      code_name: discountCode,
      cartSubtotal,
      ticketId: selectedTicket?.id || null,
      quantity: selectedTicket?.quantity || 0,
    };

    try {
      const response = await axiosInstance.post(endpoints.discount.redeem, payload);

      const { success, discountAmount, discountValue, discountType, message } = response.data;

      console.log('Backend response:', response.data);

      if (success) {
        setDiscount({
          code_name: discountCode,
          value: discountValue,
          type: discountType,
          amount: discountAmount,
          ticketId: selectedTicket?.id || null,
          quantity: selectedTicket?.quantity || 0,
          cartSubtotal,
        });
        setDiscountedPrice(discountAmount);
        console.log('Discount', discount);
        enqueueSnackbar('Discount code redeemed successfully', { variant: 'success' });
      } else {
        enqueueSnackbar(message || 'Failed to apply discount', { variant: 'error' });
      }
    } catch (err) {
      enqueueSnackbar('Invalid Discount code', { variant: 'error' });
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ mx: 'auto' }}>
        <CircularProgress
          thickness={7}
          size={25}
          sx={{
            color: (theme) => theme.palette.common.black,
            strokeLinecap: 'round',
          }}
        />
      </Box>
    );
  }

  return (
    !isLoading && (
      <Stack
        sx={{
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
              secondary="{{ event name  }}"
              primaryTypographyProps={{ variant: 'subtitle1' }}
              secondaryTypographyProps={{ color: 'white', variant: 'caption' }}
            />
          </Stack>
          <Typography>{`{{ event logo }}`}</Typography>
        </Box>

        <Box sx={{ px: 2 }}>
          <TableContainer>
            <Table>
              <TableHead
                sx={{
                  '& .MuiTableCell-head': {
                    bgcolor: 'white',
                  },
                  borderBottom: 1,
                  borderBottomColor: '#EBEBEB',
                }}
              >
                {}
                <TableRow>
                  <TableCell>Ticket Type</TableCell>
                  {!smDown && <TableCell align="center">Ticket Price</TableCell>}
                  <TableCell align="center">Quantity</TableCell>
                  {!smDown && <TableCell align="right">Subtotal</TableCell>}
                </TableRow>
              </TableHead>

              <TableBody
                sx={{
                  '& .MuiTableCell-body': {
                    border: 'none',
                  },
                  borderBottom: 1,
                  borderBottomColor: '#EBEBEB',
                }}
              >
                <TableRow>
                  {!cartItems.length && (
                    <TableCell colSpan={4}>
                      <Typography textAlign="center" variant="subtitle2" color="text.secondary">
                        Cart is empty
                      </Typography>
                    </TableCell>
                  )}
                </TableRow>

                {cartItems
                  .sort((a, b) => (dayjs(a.createdAt).isAfter(dayjs(b.createdAt)) ? 1 : -1))
                  .map((cart) => (
                    <TableRow key={cart.id} sx={{ textWrap: 'nowrap' }}>
                      <TableCell>
                        <ListItemText
                          primary={cart.ticketType.title}
                          secondary={`RM ${cart.ticketType.price}`}
                          secondaryTypographyProps={{
                            display: !smDown && 'none',
                          }}
                        />
                      </TableCell>
                      {!smDown && (
                        <TableCell align="center">{`RM ${cart.ticketType.price}`}</TableCell>
                      )}
                      <TableCell align="center">
                        {cart.quantity === 0 ? (
                          <Stack direction="row" alignItems="center" justifyContent="center">
                            <IconButton color="error" onClick={() => handleDelete(cart.id)}>
                              <Iconify width={15} icon="mdi-light:delete" />
                            </IconButton>
                            <IconButton onClick={() => handleIncrement(cart.id)}>
                              <Iconify
                                icon="material-symbols:add-rounded"
                                width={15}
                                color="green"
                              />
                            </IconButton>
                          </Stack>
                        ) : (
                          <Stack direction="row" alignItems="center" justifyContent="center">
                            <IconButton onClick={() => handleDecrement(cart.id)}>
                              <Iconify icon="ic:round-minus" width={15} color="red" />
                            </IconButton>
                            <TextField
                              value={cart.quantity}
                              type="number"
                              variant="outlined"
                              size="small"
                              sx={{
                                width: 50,
                                '& input': {
                                  textAlign: 'center', // Center-align the text
                                },
                              }}
                              onChange={(e) => onChangeTicketQuantity(e.target.value, cart.id)}
                            />
                            <IconButton onClick={() => handleIncrement(cart.id)}>
                              <Iconify
                                icon="material-symbols:add-rounded"
                                width={15}
                                color="green"
                              />
                            </IconButton>
                          </Stack>
                        )}
                      </TableCell>
                      {!smDown && (
                        <TableCell align="right" sx={{ width: 1 / 8 }}>
                          RM {parseFloat(cart.subTotal).toFixed(2)}
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                <TableRow>
                  <TableCell>
                    <FormControl sx={{ minWidth: 150 }} size="small">
                      <InputLabel id="demo-select-small-label">Ticket Type</InputLabel>
                      <Select
                        labelId="demo-select-small-label"
                        id="demo-select-small"
                        label="Ticket Type"
                        onChange={(e) => addTicket(e.target.value)}
                      >
                        <MenuItem value="">
                          <em>Select Ticket</em>
                        </MenuItem>
                        {!!data.event.ticketType &&
                          data.event.ticketType
                            .filter((ticket) =>
                              cartItems.every((item) => item.ticketTypeId !== ticket.id)
                            )
                            .map((ticket) => (
                              <MenuItem key={ticket.id} value={ticket.id}>
                                {ticket.title}
                              </MenuItem>
                            ))}
                      </Select>
                    </FormControl>
                    {/* <Button size="small" variant="outlined" sx={{ fontSize: 12 }}>
                      Add more ticket
                    </Button> */}
                  </TableCell>
                </TableRow>

                {/* {tickets.map((ticket) => (
                  <TableRow key={ticket.id} sx={{ textWrap: 'nowrap' }}>
                    <TableCell>
                      <ListItemText
                        primary={ticket.type}
                        secondary={`RM ${ticket.price}`}
                        secondaryTypographyProps={{
                          display: !smDown && 'none',
                        }}
                      />
                    </TableCell>
                    {!smDown && <TableCell align="center">{`RM ${ticket.price}`}</TableCell>}
                    <TableCell align="center">
                      {ticket.quantity === 0 ? (
                        <Stack direction="row" alignItems="center" justifyContent="center">
                          <IconButton color="error" onClick={() => handleDelete(ticket.id)}>
                            <Iconify width={15} icon="mdi-light:delete" />
                          </IconButton>
                          <IconButton onClick={() => handleIncrement(ticket.id)}>
                            <Iconify icon="material-symbols:add-rounded" width={15} color="green" />
                          </IconButton>
                        </Stack>
                      ) : (
                        <Stack direction="row" alignItems="center" justifyContent="center">
                          <IconButton onClick={() => handleDecrement(ticket.id)}>
                            <Iconify icon="ic:round-minus" width={15} color="red" />
                          </IconButton>
                          <TextField
                            value={ticket.quantity}
                            type="number"
                            variant="outlined"
                            size="small"
                            sx={{
                              width: 50,
                              '& input': {
                                textAlign: 'center', // Center-align the text
                              },
                            }}
                            onChange={(e) => onChangeTicketQuantity(e.target.value, ticket.id)}
                          />
                          <IconButton onClick={() => handleIncrement(ticket.id)}>
                            <Iconify icon="material-symbols:add-rounded" width={15} color="green" />
                          </IconButton>
                        </Stack>
                      )}
                    </TableCell>
                    {!smDown && (
                      <TableCell align="right" sx={{ width: 1 / 8 }}>
                        RM {parseFloat(ticket.subTotal).toFixed(2)}
                      </TableCell>
                    )}
                  </TableRow>
                ))} */}
              </TableBody>
            </Table>
          </TableContainer>

          <Stack
            my={2}
            direction={{ md: 'row' }}
            justifyContent="space-between"
            alignItems="start"
            gap={3}
          >
            <Stack width={1} spacing={1}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <TextField
                  size="small"
                  placeholder="Enter Discount Code"
                  value={discountCode}
                  onChange={(e) =>
                    setDiscountCode(e.target.value.toUpperCase().split(' ').join(''))
                  }
                />
                <Button
                  variant="contained"
                  size="small"
                  onClick={applyDiscountCode}
                  sx={{ height: 36 }}
                >
                  Apply
                </Button>
              </Stack>

              {!!discount && (
                <Stack maxWidth={200} spacing={1}>
                  <Stack direction="row" spacing={0.5} alignItems="center">
                    <Iconify icon="lets-icons:check-fill" color="success.main" width={13} />
                    <Typography variant="caption" fontSize={12} color="success">
                      Discount code applied
                    </Typography>
                  </Stack>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="caption" fontSize={12}>
                      {discount.code}
                    </Typography>
                    <Typography variant="caption" color="error" fontSize={12}>
                      - {discount.value}
                    </Typography>
                  </Stack>
                </Stack>
              )}
            </Stack>

            <Stack
              sx={{
                '& .MuiTypography-root': {
                  fontSize: 14,
                  fontWeight: 500,
                },
                textWrap: 'nowrap',
              }}
              width={1}
              spacing={1}
              flexShrink={2}
            >
              <Stack direction="row" alignItems="center" gap={10} justifyContent="space-between">
                <Typography>Subtotal:</Typography>
                <Typography>RM {subTotal}.00</Typography>
              </Stack>
              <Stack direction="row" alignItems="center" gap={10} justifyContent="space-between">
                <Typography>Discount</Typography>
                <Typography>RM {parseFloat(discountedPrice).toFixed(2)}</Typography>
              </Stack>
              <Stack direction="row" alignItems="center" gap={10} justifyContent="space-between">
                <Typography>SST:</Typography>
                <Typography>RM 11.94</Typography>
              </Stack>
              <Divider />
              <Stack direction="row" alignItems="center" gap={10} justifyContent="space-between">
                <Typography sx={{ fontWeight: 800 }}>Total:</Typography>
                <Typography>
                  RM{' '}
                  {subTotal > 0
                    ? parseFloat(totalPrice).toFixed(2)
                    : parseFloat(subTotal).toFixed(2)}
                </Typography>
              </Stack>
            </Stack>
          </Stack>
        </Box>
      </Stack>
    )
  );
};

export default TicketSelectionCard;

import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { useAuth } from '../../context/AuthContext.jsx';

const ManageRoles = () => {
  const { users, updateRole } = useAuth();

  const handleRoleChange = (userId, nextRole) => {
    updateRole(userId, nextRole);
  };

  return (
    <Stack spacing={3}>
      <Typography variant="h4" component="h1">
        Manage Roles
      </Typography>
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Role</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id} hover>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell width={200}>
                    <FormControl fullWidth size="small">
                      <InputLabel id={`role-label-${user.id}`}>Role</InputLabel>
                      <Select
                        labelId={`role-label-${user.id}`}
                        value={user.role}
                        label="Role"
                        onChange={(event) => handleRoleChange(user.id, event.target.value)}
                      >
                        <MenuItem value="admin">Admin</MenuItem>
                        <MenuItem value="user">User</MenuItem>
                      </Select>
                    </FormControl>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        {users.length === 0 && (
          <Box sx={{ p: 3 }}>
            <Typography color="text.secondary">No users available.</Typography>
          </Box>
        )}
      </Paper>
    </Stack>
  );
};

export default ManageRoles;

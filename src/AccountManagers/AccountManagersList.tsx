import { Button, IconButton, List, ListItem, ListItemButton, ListItemText, Stack } from "@mui/material";
import { useCallback, useEffect, useState } from "react";
import { remult } from "../common"
import { AccountManager } from "./AccountManager.entity"
import AddIcon from '@mui/icons-material/Add';
import { AccountManagerEdit } from "./AccountManagerEdit";
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

const amRepo = remult.repo(AccountManager);

export const AccountManagersList: React.FC<{}> = () => {
    const [accountManagers, setAccountManagers] = useState<AccountManager[]>([]);
    const loadAccountManagers = useCallback(() => amRepo.find().then(setAccountManagers), []);
    useEffect(() => {
        loadAccountManagers()
    }, [loadAccountManagers]);
    const [newAccountManager, setNewAccountManager] = useState<AccountManager>();
    const [editAccountManager, setEditAccountManager] = useState<AccountManager>();
    const deleteAccountManager = async (deletedAccountManager: AccountManager) => {
        await amRepo.delete(deletedAccountManager);
        setAccountManagers(accountManagers.filter(accountManager => deletedAccountManager.id != accountManager.id));
    }
    const editAccountManagerSaved = (editAccountManager: AccountManager) =>
        setAccountManagers(accountManagers.map(accountManager => accountManager.id === editAccountManager.id ? editAccountManager : accountManager));

    return <div>
        <Button
            variant="contained"
            onClick={() => setNewAccountManager(amRepo.create())}
            startIcon={<AddIcon />}>
            Add Account Manager
        </Button>
        <List>
            {accountManagers.map(am => (
                <ListItem disablePadding key={am.id} secondaryAction={
                    <Stack direction="row" spacing={2}>
                        <IconButton edge="end" aria-label="edit"
                            onClick={() => deleteAccountManager(am)}>
                            <DeleteIcon />
                        </IconButton>
                        <IconButton edge="end" aria-label="edit"
                            onClick={() => setEditAccountManager(am)}>
                            <EditIcon />
                        </IconButton>
                    </Stack>
                }>
                    <ListItemButton>
                        <ListItemText primary={am.lastName + " " + am.firstName} />
                    </ListItemButton>
                </ListItem>
            ))}

        </List>
        {editAccountManager && <AccountManagerEdit
            accountManager={editAccountManager}
            create={false}
            onClose={() => setEditAccountManager(undefined)}
            onSaved={(accountManager) => {
                editAccountManagerSaved(accountManager)
            }} />}
        {newAccountManager && <AccountManagerEdit
            accountManager={newAccountManager}
            create={true}
            onClose={() => setNewAccountManager(undefined)}
            onSaved={() => {
                loadAccountManagers()
            }} />}
    </div>
}
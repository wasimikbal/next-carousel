'use client'
import React, { useState } from 'react';
import ConfigDialog from './ConfigDialog';

const ConfigDialogClient: React.FC = () => {
    const [is3DDialogOpen, setIs3DDialogOpen] = useState(false);

    const openDialog = () => setIs3DDialogOpen(true);
    const closeDialog = () => setIs3DDialogOpen(false);

    return (
        <div>
            <button onClick={openDialog}>Open</button>
            {is3DDialogOpen && (<ConfigDialog isOpen={is3DDialogOpen} onClose={closeDialog}/>)}
        </div>
    );
}

export default ConfigDialogClient;

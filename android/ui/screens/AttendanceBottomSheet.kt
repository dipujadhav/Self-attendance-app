package com.selfattendance.pro.ui.screens

import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.selfattendance.pro.data.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AttendanceActionBottomSheet(
    date: String,
    onDismiss: () -> Unit,
    onSave: (AttendanceRecord) -> Unit
) {
    var status by remember { mutableStateOf(AttendanceStatus.PRESENT) }
    var shift by remember { mutableStateOf(ShiftType.GENERAL) }
    var ot by remember { mutableStateOf("") }
    var hasChanges by remember { mutableStateOf(false) }

    ModalBottomSheet(onDismissRequest = onDismiss) {
        Column(modifier = Modifier.padding(24.dp).fillMaxWidth()) {
            Text("Log for $date", style = MaterialTheme.typography.headlineSmall)
            
            Spacer(modifier = Modifier.height(16.dp))
            
            // Status Grid (Simplified for code snippet)
            Text("Status", style = MaterialTheme.typography.labelLarge)
            Row {
                AttendanceStatus.values().filter { it != AttendanceStatus.UNMARKED }.forEach { s ->
                    FilterChip(
                        selected = status == s,
                        onClick = { status = s; hasChanges = true },
                        label = { Text(s.name) }
                    )
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            OutlinedTextField(
                value = ot,
                onValueChange = { ot = it; hasChanges = true },
                label = { Text("Overtime (Minutes)") },
                modifier = Modifier.fillMaxWidth()
            )

            Spacer(modifier = Modifier.height(32.dp))

            Button(
                onClick = { 
                    onSave(AttendanceRecord(date, "default", status, shift, ot.toIntOrNull() ?: 0))
                },
                modifier = Modifier.fillMaxWidth(),
                enabled = hasChanges, // Rule: Save disabled until changes made
                shape = androidx.compose.foundation.shape.RoundedCornerShape(16.dp)
            ) {
                Text("SAVE CHANGES")
            }
            
            Spacer(modifier = Modifier.height(16.dp))
        }
    }
}
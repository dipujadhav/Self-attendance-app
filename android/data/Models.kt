package com.selfattendance.pro.data

import androidx.room.Entity
import androidx.room.PrimaryKey

enum class AttendanceStatus { PRESENT, ABSENT, HALF_DAY, HOLIDAY, WEEKLY_OFF, UNMARKED }
enum class ShiftType { MORNING, AFTERNOON, NIGHT, GENERAL }

@Entity(tableName = "work_profiles")
data class WorkProfile(
    @PrimaryKey val id: String,
    val name: String,
    val color: Int,
    val isSelected: Boolean = false
)

@Entity(tableName = "attendance_records", primaryKeys = ["date", "profileId"])
data class AttendanceRecord(
    val date: String, // YYYY-MM-DD
    val profileId: String,
    val status: AttendanceStatus,
    val shift: ShiftType,
    val overtimeMinutes: Int = 0,
    val notes: String = "",
    val leaveType: String? = null
)
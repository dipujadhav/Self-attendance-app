package com.selfattendance.pro.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.selfattendance.pro.data.*
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch

data class AttendanceUiState(
    val profiles: List<WorkProfile> = emptyList(),
    val activeProfile: WorkProfile? = null,
    val records: List<AttendanceRecord> = emptyList(),
    val attendanceScore: Float = 0f,
    val isLoading: Boolean = false
)

class AttendanceViewModel(private val dao: AttendanceDao) : ViewModel() {
    private val _uiState = MutableStateFlow(AttendanceUiState())
    val uiState = _uiState.asStateFlow()

    init {
        loadData()
    }

    private fun loadData() {
        viewModelScope.launch {
            dao.getAllProfiles().collect { profiles ->
                val active = profiles.find { it.isSelected } ?: profiles.firstOrNull()
                _uiState.update { it.copy(profiles = profiles, activeProfile = active) }
                
                active?.let { profile ->
                    dao.getRecordsForProfile(profile.id).collect { records ->
                        calculateScore(records)
                    }
                }
            }
        }
    }

    private fun calculateScore(records: List<AttendanceRecord>) {
        val workingDays = records.count { 
            it.status == AttendanceStatus.PRESENT || 
            it.status == AttendanceStatus.ABSENT || 
            it.status == AttendanceStatus.HALF_DAY 
        }
        
        if (workingDays == 0) {
            _uiState.update { it.copy(records = records, attendanceScore = 0f) }
            return
        }

        val presentCount = records.count { it.status == AttendanceStatus.PRESENT }.toFloat()
        val halfDayCount = records.count { it.status == AttendanceStatus.HALF_DAY }.toFloat()
        
        val score = ((presentCount + (halfDayCount * 0.5f)) / workingDays) * 100
        _uiState.update { it.copy(records = records, attendanceScore = score) }
    }

    fun saveAttendance(record: AttendanceRecord) {
        viewModelScope.launch {
            dao.saveRecord(record)
        }
    }
}